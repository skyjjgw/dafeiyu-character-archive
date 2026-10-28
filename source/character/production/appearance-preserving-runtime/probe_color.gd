extends SceneTree

func _initialize()->void:
	var image=Image.create(2,2,false,Image.FORMAT_RGBA8)
	image.set_pixel(0,0,Color.BLACK)
	image.set_pixel(1,0,Color.WHITE)
	image.set_pixel(0,1,Color.WHITE)
	image.set_pixel(1,1,Color.BLACK)
	image.generate_mipmaps()
	var offset=image.get_mipmap_offset(1)
	var data=image.get_data()
	var result={"engine":Engine.get_version_info(),"imageFormat":"RGBA8","base":"2 black, 2 white pixels","mip1Bytes":[data[offset],data[offset+1],data[offset+2],data[offset+3]],"linearAverageExpectedDisplay":Color(.5,.5,.5,1).linear_to_srgb(),"scope":"Actual CPU Image.generate_mipmaps probe only; source WebGL comparison still required"}
	var file=FileAccess.open("res://reports/rgba8-mipmap-probe.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(result,"\t"))
	print("COLOR_PROBE ",JSON.stringify(result))
	var source=JSON.parse_string(FileAccess.get_file_as_string("res://assets/source-rendering.json"))
	var decoded:Array=[]
	for index in range(source.images.size()):
		var entry=source.images[index]
		var pixels=Image.new()
		var raw=FileAccess.get_file_as_bytes("res://assets/"+str(entry.name))
		var error=pixels.load_jpg_from_buffer(raw) if entry.mimeType=="image/jpeg" else pixels.load_png_from_buffer(raw)
		if error!=OK:
			quit(1)
			return
		pixels.convert(Image.FORMAT_RGBA8)
		var name="decoded-source-%d.rgba8" % index
		var output=FileAccess.open("res://reports/"+name,FileAccess.WRITE)
		output.store_buffer(pixels.get_data())
		decoded.append({"index":index,"name":name,"width":pixels.get_width(),"height":pixels.get_height(),"sourceSha256":entry.sha256})
	var manifest=FileAccess.open("res://reports/decoded-source-images.json",FileAccess.WRITE)
	manifest.store_string(JSON.stringify(decoded,"\t"))
	quit()
