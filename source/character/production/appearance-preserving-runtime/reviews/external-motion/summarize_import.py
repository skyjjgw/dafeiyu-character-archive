"""Summarize actual Godot import evidence; no synthetic animation generation."""
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
REPORTS = ROOT / "references/test-assets/motion/reports"
data = json.loads((REPORTS / "godot-import.json").read_text(encoding="utf-8"))
length = lambda v: math.sqrt(sum(x*x for x in v))
files = []
for source in data["files"]:
    clips = []
    for clip in source["animations"]:
        intervals = [t["median_key_interval"] for t in clip["tracks"] if t["median_key_interval"]]
        clips.append({"name": clip["name"], "seconds": clip["seconds"], "tracks": clip["track_count"],
                      "fps_from_actual_keys": 1 / sorted(intervals)[len(intervals)//2] if intervals else None,
                      "key_quaternions_finite": clip["finite"], "max_quaternion_norm_error": clip["quaternion_norm_max_error"],
                      "root_translation_tracks": [t for t in clip["tracks"] if t["path"].endswith(":root") and t["type"] == 1]})
    files.append({"file": source["file"], "sha256": source["sha256"], "bytes": source["bytes"],
                  "bones": len(source["bones"]), "clips": len(clips), "animations": clips})
src = {b["name"]: b for b in data["files"][0]["bones"]}
tgt = {b["name"]: b for b in data["target"]}
ratios = []
for label, source, target in [("left_upper_arm", "lowerarm_l", "left elbow _ sleeve"),
                               ("left_forearm", "hand_l", "left wrist _ fingers"),
                               ("left_thigh", "calf_l", "left knee _ sock"),
                               ("left_calf", "foot_l", "left ankle _ shoe")]:
    sl = length(src[source]["local_rest"]["origin"])
    tl = length(tgt[target]["local_pose"]["origin"]) * .35
    ratios.append({"segment": label, "source_m": sl, "target_m": tl, "ratio": tl / sl})
summary = {"engine": data["engine"], "files": files, "segment_scale_ratios": ratios,
           "source_static_root_basis": src["root"]["local_rest"]["basis"],
           "target_total_body_bones": len(data["target"]),
           "mapped_body_bones": 15, "preserved_nonhuman_bones": 7,
           "root_motion_policy": "RM Walk displaces 1.3m/1.333s; excluded. In-place rotations only, original target origins retained. Existing controller alone moves the target root in contact override mode.",
           "status": "Actual import and independent retarget experiment; raw gait rejected, not promoted to selected current"}
(REPORTS / "import-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"files": [{"file": f["file"], "bones": f["bones"], "clips": f["clips"]} for f in files], "segment_scale_ratios": ratios}, indent=2))
