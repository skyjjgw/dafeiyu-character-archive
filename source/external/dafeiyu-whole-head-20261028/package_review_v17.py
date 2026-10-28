import bpy,json
P='D:/CodexTaskData/dafeiyu-whole-head-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/native-v17.blend');s=bpy.context.scene
coll=bpy.data.collections.new('DAFEIYU_HEAD_NATIVE');s.collection.children.link(coll)
root=bpy.data.objects['HEAD_ROOT__raw_coordinate_frame']
for o in [root]+list(root.children_recursive):
 if o.hide_render:continue
 for c in list(o.users_collection):c.objects.unlink(o)
 coll.objects.link(o)
root['state']='Candidate v17; awaiting whole-character visual review';root['frame']='X+ front, Z+ up; raw TripoSR same units';root['neck_interface']='center .105,-.06,.045; radius X .040/Y .043'
bpy.ops.wm.save_as_mainfile(filepath=P+'/head-native-review-v17.blend')
json.dump({'status':'not accepted; integrate for whole-character review','file':P+'/head-native-review-v17.blend','collection':'DAFEIYU_HEAD_NATIVE','coordinate_frame':'X+ front Z+ up','neck_center':[.105,-.06,.045],'neck_radii':[.04,.043],'root_transform':'identity','source':'same selected original face paint and eye outlines; full new continuous skull, sockets, oral cup and neck mesh','meshes':[o.name for o in coll.objects if o.type=='MESH']},open(P+'/head-integration-v17.json','w'),indent=2)

