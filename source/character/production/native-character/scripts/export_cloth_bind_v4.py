"""Bake actual GLB primitive vertices onto existing physical cage triangles.

The nearest-triangle search is conservative: centroid radius broadphase is
followed by exact triangle/edge closest-point queries. Missing faces stay holes.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import struct
from itertools import product
from pathlib import Path
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
import numpy as np

TYPES = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}
DTYPES = {5120: "i1", 5121: "u1", 5122: "<i2", 5123: "<u2", 5125: "<u4", 5126: "<f4"}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

class GLB:
    def __init__(self, path):
        raw = path.read_bytes()
        self.sha256 = hashlib.sha256(raw).hexdigest()
        magic, version, length = struct.unpack_from("<III", raw)
        if (magic, version, length) != (0x46546C67, 2, len(raw)):
            raise ValueError("Incomplete or unsupported GLB")
        self.doc, self.binary = None, None
        offset = 12
        while offset < len(raw):
            size, kind = struct.unpack_from("<II", raw, offset)
            chunk = raw[offset + 8:offset + 8 + size]
            if kind == 0x4E4F534A:
                self.doc = json.loads(chunk.decode("utf-8").rstrip("\x00 \r\n\t"))
            elif kind == 0x004E4942:
                self.binary = chunk
            offset += 8 + size
        if self.doc is None or self.binary is None:
            raise ValueError("GLB JSON/BIN chunks are required")
        self.parents = {}
        for index, node in enumerate(self.doc.get("nodes", [])):
            for child in node.get("children", []):
                self.parents[child] = index
        self.world_cache = {}

    def accessor(self, index):
        a = self.doc["accessors"][index]
        components = TYPES[a["type"]]
        dtype = np.dtype(DTYPES[a["componentType"]])
        if "sparse" in a:
            raise ValueError("Sparse accessors require explicit expansion before cloth binding")
        if "bufferView" not in a:
            return np.zeros((a["count"], components), dtype=dtype)
        view = self.doc["bufferViews"][a["bufferView"]]
        if view.get("buffer", 0) != 0:
            raise ValueError("Only the local GLB BIN buffer is supported")
        stride = view.get("byteStride", dtype.itemsize * components)
        offset = view.get("byteOffset", 0) + a.get("byteOffset", 0)
        result = np.ndarray((a["count"], components), dtype=dtype,
                            buffer=self.binary, offset=offset,
                            strides=(stride, dtype.itemsize)).copy()
        if a.get("normalized") and dtype.kind in "iu":
            info = np.iinfo(dtype)
            result = result.astype(np.float64) / info.max
            if dtype.kind == "i":
                result = np.maximum(result, -1)
        return result

    def world(self, index):
        if index in self.world_cache:
            return self.world_cache[index]
        node = self.doc["nodes"][index]
        if "matrix" in node:
            local = np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
        else:
            x, y, z, w = node.get("rotation", [0, 0, 0, 1])
            rotation = np.array([
                [1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)],
            ], dtype=np.float64)
            local = np.eye(4)
            local[:3, :3] = rotation @ np.diag(node.get("scale", [1, 1, 1]))
            local[:3, 3] = node.get("translation", [0, 0, 0])
        result = self.world(self.parents[index]) @ local if index in self.parents else local
        self.world_cache[index] = result
        return result

    def positions(self, node_index, primitive):
        node = self.doc["nodes"][node_index]
        p = self.accessor(primitive["attributes"]["POSITION"]).astype(np.float64)
        m = self.world(node_index)
        node_positions = p @ m[:3, :3].T + m[:3, 3]
        if "skin" not in node:
            return node_positions, 0.0
        skin = self.doc["skins"][node["skin"]]
        bind = self.accessor(skin["inverseBindMatrices"]).reshape(-1, 4, 4).transpose(0, 2, 1) if "inverseBindMatrices" in skin else np.repeat(np.eye(4)[None], len(skin["joints"]), axis=0)
        matrices = np.stack([self.world(joint) @ bind[i] for i, joint in enumerate(skin["joints"])])
        output, total = np.zeros_like(p), np.zeros(len(p))
        for suffix in ("0", "1"):
            ji, wi = "JOINTS_"+suffix, "WEIGHTS_"+suffix
            if ji not in primitive["attributes"]:
                continue
            joints = self.accessor(primitive["attributes"][ji]).astype(np.int64)
            weights = self.accessor(primitive["attributes"][wi]).astype(np.float64)
            for column in range(joints.shape[1]):
                selected = matrices[joints[:, column]]
                output += (np.einsum("nij,nj->ni", selected[:, :3, :3], p) + selected[:, :3, 3]) * weights[:, column, None]
                total += weights[:, column]
        if np.any(total < .999):
            raise ValueError("Skinned cloth source contains incomplete skin weights")
        output /= total[:, None]
        return output, float(np.linalg.norm(output-node_positions, axis=1).max(initial=0))

def closest(points, tri):
    """Vectorized exact point/triangle closest points and barycentric weights."""
    a, b, c = tri[..., 0, :], tri[..., 1, :], tri[..., 2, :]
    ab, ac, ap = b-a, c-a, points-a
    d00, d01, d11 = np.sum(ab*ab, -1), np.sum(ab*ac, -1), np.sum(ac*ac, -1)
    d20, d21 = np.sum(ap*ab, -1), np.sum(ap*ac, -1)
    denominator = d00*d11-d01*d01
    v = np.divide(d11*d20-d01*d21, denominator, out=np.zeros_like(d20), where=denominator>1e-24)
    w = np.divide(d00*d21-d01*d20, denominator, out=np.zeros_like(d20), where=denominator>1e-24)
    inside = (v>=0) & (w>=0) & (v+w<=1) & (denominator>1e-24)
    bary = np.stack([1-v-w, v, w], axis=-1)
    q = a+ab*v[..., None]+ac*w[..., None]
    best = np.where(inside, np.sum((points-q)**2, -1), np.inf)
    for first, second, index_a, index_b in [(a,b,0,1),(b,c,1,2),(c,a,2,0)]:
        edge = second-first
        t = np.clip(np.sum((points-first)*edge,-1)/np.maximum(np.sum(edge*edge,-1),1e-24), 0, 1)
        candidate = first+edge*t[...,None]
        distance = np.sum((points-candidate)**2,-1)
        mask = distance < best
        edge_bary = np.zeros_like(bary)
        edge_bary[...,index_a] = 1-t
        edge_bary[...,index_b] = t
        bary = np.where(mask[...,None], edge_bary, bary)
        q = np.where(mask[...,None], candidate, q)
        best = np.minimum(best, distance)
    return best, q, bary

class Cage:
    def __init__(self, data):
        self.vertices = np.array(data["vertices"], dtype=np.float64)
        all_triangles = np.array(data["triangles"], dtype=np.int64)
        if all_triangles.ndim!=2 or all_triangles.shape[1]!=3:
            raise ValueError("Explicit triangle triples are required")
        if all_triangles.min()<0 or all_triangles.max()>=len(self.vertices):
            raise ValueError("Cage triangle index out of range")
        tri = self.vertices[all_triangles]
        normals = np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
        valid = np.linalg.norm(normals,axis=1)>1e-12
        self.ids = np.flatnonzero(valid)
        self.tri = tri[valid]
        self.normals = normals[valid]/np.linalg.norm(normals[valid],axis=1)[:,None]
        self.centers = self.tri.mean(axis=1)
        self.radius = float(np.linalg.norm(self.tri-self.centers[:,None,:],axis=2).max())
        self.cell_size = max(self.radius*2, .005)
        self.buckets = {}
        for index, center in enumerate(self.centers):
            key = tuple(np.floor(center/self.cell_size).astype(np.int64))
            self.buckets.setdefault(key, []).append(index)

    def box_candidates(self, lower, upper):
        first = np.floor(lower/self.cell_size).astype(np.int64)
        last = np.floor(upper/self.cell_size).astype(np.int64)
        result=[]
        for key in product(*(range(int(first[i]),int(last[i])+1)for i in range(3))):
            result.extend(self.buckets.get(key, ()))
        return np.asarray(result,dtype=np.int64)

    def bind(self, points):
        tri_ids, barys, offsets, normal_offsets = [], [], [], []
        for point in points:
            candidates=np.empty(0,dtype=np.int64)
            for reach in (0,1,2,4,8):
                radius=reach*self.cell_size
                candidates=self.box_candidates(point-radius,point+radius)
                if len(candidates): break
            if not len(candidates): candidates=np.arange(len(self.tri))
            distances, _, _=closest(point,self.tri[candidates])
            best=float(np.sqrt(distances.min()))
            # Any closer triangle centroid is within best + max centroid radius.
            # The enclosing grid box therefore cannot omit a better triangle.
            radius=best+self.radius+1e-10
            candidates=self.box_candidates(point-radius,point+radius)
            distances, q, bary = closest(point,self.tri[candidates])
            selected = int(np.argmin(distances))
            index = int(candidates[selected])
            offset = point-q[selected]
            tri_ids.append(int(self.ids[index]))
            barys.append(bary[selected].tolist())
            offsets.append(offset.tolist())
            normal_offsets.append(float(offset@self.normals[index]))
        return tri_ids,barys,offsets,normal_offsets

def rounded(values):
    return np.round(np.asarray(values,dtype=np.float64),9).tolist()

def export(source, cage_path, output):
    cage_bytes = cage_path.read_bytes()
    cage_sha256 = hashlib.sha256(cage_bytes).hexdigest()
    cage_data = json.loads(cage_bytes.decode("utf-8-sig"))
    cage = Cage(cage_data)
    glb = GLB(source)
    prefixes = cage_data.get("renderMeshPrefixes", ["Maid skirt","White shaped apron","Apron continuous","Whale embroidery"])
    meshes=[]
    all_offsets=[]
    max_reconstruction=0.0
    brute_checks=0
    max_nearest_error=0.0
    for node_index,node in enumerate(glb.doc.get("nodes",[])):
        if "mesh" not in node:
            continue
        mesh=glb.doc["meshes"][node["mesh"]]
        name=node.get("name",mesh.get("name",""))
        if not any(name.startswith(prefix) or mesh.get("name","").startswith(prefix) for prefix in prefixes):
            continue
        for primitive_index,primitive in enumerate(mesh["primitives"]):
            if primitive.get("mode",4)!=4 or "POSITION" not in primitive.get("attributes",{}):
                raise ValueError(f"Unsupported cloth primitive {name}/{primitive_index}")
            points,skin_delta=glb.positions(node_index,primitive)
            tri_ids,bary,offsets,normal_offsets=cage.bind(points)
            triangles=np.array(cage_data["triangles"],dtype=np.int64)[tri_ids]
            reconstruct=(cage.vertices[triangles]*np.array(bary)[:,:,None]).sum(axis=1)+offsets
            error=float(np.linalg.norm(reconstruct-points,axis=1).max(initial=0))
            max_reconstruction=max(max_reconstruction,error)
            lengths=np.linalg.norm(offsets,axis=1)
            for sample in np.linspace(0,len(points)-1,min(12,len(points)),dtype=np.int64):
                distances,_,_=closest(points[sample],cage.tri)
                error_nearest=abs(float(np.sqrt(distances.min()))-float(lengths[sample]))
                max_nearest_error=max(max_nearest_error,error_nearest)
                brute_checks+=1
            if max_nearest_error>1e-9:
                raise ValueError("Spatial broadphase omitted a closer triangle")
            all_offsets.extend(lengths.tolist())
            material=glb.doc.get("materials",[])[primitive["material"]].get("name","") if "material" in primitive else ""
            canonical=points[np.lexsort((points[:,2],points[:,1],points[:,0]))]
            meshes.append({"nodeName":name,"nodeIndex":node_index,"meshName":mesh.get("name",""),"meshIndex":node["mesh"],"primitiveIndex":primitive_index,"materialName":material,"vertexCount":len(points),"positionSha256Rounded1e6":hashlib.sha256(np.round(points,6).astype("<f4").tobytes()).hexdigest(),"canonicalPositionSha256Rounded1e6":hashlib.sha256(np.round(canonical,6).astype("<f4").tobytes()).hexdigest(),"modelRestPositions":rounded(points),"triIds":tri_ids,"barycentric":rounded(bary),"restOffsets":rounded(offsets),"normalOffsets":rounded(normal_offsets),"qa":{"maxOffset":float(lengths.max(initial=0)),"meanOffset":float(lengths.mean()),"maxReconstructionError":error,"skinRestDeltaFromNodeTransform":skin_delta}})
            print(f"Bound {name} primitive {primitive_index}: {len(points)} vertices, max offset {lengths.max():.6f}m",flush=True)
    if not meshes:
        raise ValueError("No cloth meshes matched renderMeshPrefixes")
    if sha(source)!=glb.sha256 or sha(cage_path)!=cage_sha256:
        raise ValueError("Input GLB/cage changed while binding; previous output retained")
    result={"schema":"dafeiyu.cloth-render-bind.v2","coordinateFrame":"Godot +Yup/+Zforward model-local; final GLB primitive accessor order","sourceGLB":{"path":str(source.resolve()),"sha256":sha(source)},"sourceCage":{"path":str(cage_path.resolve()),"sha256":sha(cage_path),"vertices":len(cage.vertices),"triangles":len(cage_data['triangles'])},"embedding":{"triId":"Index into sourceCage.triangles; only existing non-degenerate faces","barycentric":"Three nonnegative weights summing to one","restOffset":"modelRestPosition - barycentric rest triangle point; full 3D vector required near trim boundaries","shaderIndices":"[a,b,c,c]","shaderWeights":"[w0,w1,w2,0]","runtimeRemap":"Check modelRestPositions/fingerprint against imported surfaces; remap by position if importer reordered/split vertices. Never assume Blender base-vertex indices."},"meshes":meshes,"qa":{"renderPrimitives":len(meshes),"renderVertices":sum(x['vertexCount']for x in meshes),"validCageTriangles":len(cage.ids),"excludedDegenerateTriangles":len(cage_data['triangles'])-len(cage.ids),"maxReconstructionError":max_reconstruction,"maximumOffset":max(all_offsets),"offsetP95":float(np.quantile(all_offsets,.95)),"bruteforceNearestChecks":brute_checks,"maxNearestDistanceError":max_nearest_error,"search":"Exact triangle closest-point after conservative centroid-radius uniform spatial hash"}}
    result["sourceGLB"]["sha256"] = glb.sha256
    result["sourceCage"]["sha256"] = cage_sha256
    output.parent.mkdir(parents=True,exist_ok=True)
    temporary=output.with_suffix(output.suffix+".tmp")
    temporary.write_text(json.dumps(result,separators=(",",":"),ensure_ascii=False),encoding="utf-8")
    temporary.replace(output)
    print(json.dumps(result['qa']),flush=True)

if __name__=="__main__":
    root=Path(__file__).resolve().parents[1]
    parser=argparse.ArgumentParser()
    parser.add_argument("--source",type=Path,default=root/"assets/body-v4-bind.glb")
    parser.add_argument("--cage",type=Path,default=root/"assets/skirt-physics-cage-v4.json")
    parser.add_argument("--output",type=Path,default=root/"assets/cloth-render-bind-v4.json")
    args=parser.parse_args()
    export(args.source,args.cage,args.output)
