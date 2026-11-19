import bpy, math
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
# meters-equivalent unit: width 2.8, length 4.1, thickness .58

def mat(name,col,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
white=mat('soft warm ivory polycarbonate',(.72,.70,.66),0,.56);rim=mat('fine ivory rim',(.68,.68,.65),0,.4);face=mat('soft white elastomer contact face',(.56,.57,.55),0,.74);printing=mat('subtle magnetic ring printing',(.50,.52,.50),0,.60);silver=mat('satin aluminum cell pouch',(.56,.59,.59),.72,.33);green=mat('dark green solder mask',(.025,.105,.072),.04,.4);black=mat('molded electronic black',(.018,.022,.021),.04,.42);gold=mat('contacts gold',(.7,.43,.12),.75,.33);copper=mat('enameled copper',(.5,.2,.08),.74,.32);metal=mat('usb port brushed metal',(.46,.49,.49),.86,.28);lens=mat('indicators opaque glass',(.22,.29,.30),.10,.23);paper=mat('pouch label',(.82,.83,.79),0,.62)

def parent(name):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o
parents={n:parent(n) for n in ['shell','magnet','cell','board','port','button']}

def rounded(name,size,pos,bevel,material,part=None):
 w,h,d=size; r=min(bevel,w/2-.001,h/2-.001); points=[]
 for cx,cy,base in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
  for i in range(13):
   ang=math.radians(base+i*90/12); points.append((cx+r*math.cos(ang),cy+r*math.sin(ang)))
 n=len(points); vertices=[(x,y,-d/2) for x,y in points]+[(x,y,d/2) for x,y in points]
 faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.location=pos
 b=o.modifiers.new('fine edge radii','BEVEL');b.width=min(.018,d/5);b.segments=3;o.modifiers.new('weighted normals','WEIGHTED_NORMAL');bpy.context.view_layer.objects.active=o
 for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
 for f in o.data.polygons:f.use_smooth=False
 if material:o.data.materials.append(material)
 if part:o.parent=parents[part]
 return o

def cut(obj,cutter):
 bpy.context.view_layer.objects.active=obj;mod=obj.modifiers.new('opening','BOOLEAN');mod.object=cutter;mod.operation='DIFFERENCE';bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
 for poly in obj.data.polygons:poly.use_smooth=False
 normal=obj.modifiers.new('correct boolean normals','WEIGHTED_NORMAL');normal.keep_sharp=True

def cylinder(name,radius,depth,pos,material,part,rotation=(0,0,0),verts=64):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=pos,rotation=rotation);o=bpy.context.object;o.name=name;o.data.materials.append(material);o.parent=parents[part];b=o.modifiers.new('machined edge','BEVEL');b.width=.012;b.segments=3;o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
 for f in o.data.polygons:f.use_smooth=True
 return o

def torus(name,major,minor,pos,material,part):
 bpy.ops.mesh.primitive_torus_add(major_segments=128,minor_segments=16,location=pos,major_radius=major,minor_radius=minor);o=bpy.context.object;o.name=name;o.data.materials.append(material);o.parent=parents[part]
 for f in o.data.polygons:f.use_smooth=True
 return o

# Seam-defined rear injection molded enclosure, open to front, realistic wall thickness.
shell=rounded('Rear housing open shell',(2.86,4.16,.58),(0,0,-.025),.35,metal,'shell')
cut(shell,rounded('inner cavity cutting',(2.62,3.92,.53),(0,0,.08),.25,None))
# Single USB-C opening into bottom edge
usb_cut=rounded('usb opening cutting',(.46,.16,.28),(0,-2.08,-.01),.075,None);usb_cut.rotation_euler[0]=math.pi/2;cut(shell,usb_cut)
# Rear soft-touch panel and metallic perimeter are modeled together as the rear assembly.
rounded('Rear soft touch panel',(2.72,4.02,.025),(0,0,-.326),.32,white,'shell')
# lid a separately removable but grouped external part
rounded('Continuous front cover',(2.86,4.16,.085),(0,0,.31),.35,white,'shell')
# subtle seam and broad flat magnetic pad, rendered as integrated contact face
rounded('Seam around front',(2.81,4.11,.015),(0,0,.263),.33,rim,'shell')
# round contact surface (near flush, understated)
cylinder('Soft touch circular interface',.94,.003,(0,.35,.355),face,'magnet')
torus('Alignment ring printed surface',.76,.004,(0,.35,.358),printing,'magnet')
rounded('Alignment marker',(.035,.23,.003),(0,-.65,.358),.017,printing,'magnet')
# Illustrative backing layer: exact A1665 shielding material and geometry unconfirmed.
cylinder('Illustrative coil backing',.74,.025,(0,.35,.165),black,'magnet')
# coil and shielding appear below face, inside device
# A continuous planar winding and segmented alignment array, shown schematically.
winding = bpy.data.curves.new('Spiral winding', 'CURVE')
winding.dimensions = '3D'
winding.bevel_depth = .015
winding.bevel_resolution = 2
wire = winding.splines.new('POLY')
turns, samples = 10, 720
wire.points.add(samples)
for i, point in enumerate(wire.points):
 fraction = i / samples
 angle = math.tau * turns * fraction
 radius = .315 + .39 * fraction
 point.co = (radius * math.cos(angle), radius * math.sin(angle), 0, 1)
coil = bpy.data.objects.new('Wireless coil copper winding', winding)
bpy.context.collection.objects.link(coil)
coil.parent = parents['magnet']
coil.location = (0, .35, .22)
coil.data.materials.append(copper)
bpy.context.view_layer.objects.active = coil
bpy.ops.object.select_all(action='DESELECT')
coil.select_set(True)
bpy.ops.object.convert(target='MESH')

vertices, faces = [], []
for segment in range(16):
 start = len(vertices)
 for sample in range(9):
  angle = math.tau * (segment + .035 + .93 * sample / 8) / 16
  for radius, height in [(.775,-.022),(.89,-.022),(.89,.022),(.775,.022)]:
   vertices.append((radius*math.cos(angle), radius*math.sin(angle), height))
 for j in range(8):
  for k in range(4):
   left = start + 4*j
   n = (k+1)%4
   faces.append((left+k,left+4+k,left+4+n,left+n))
 faces.extend([(start,start+1,start+2,start+3),tuple(start+32+k for k in (3,2,1,0))])
array_mesh = bpy.data.meshes.new('Segmented magnet array')
array_mesh.from_pydata(vertices, [], faces)
array_mesh.update()
array = bpy.data.objects.new('Magnet array ring', array_mesh)
bpy.context.collection.objects.link(array)
array.parent = parents['magnet']
array.location = (0,.35,.2)
array.data.materials.append(mat('satin graphite magnets',(.17,.19,.20),.66,.32))
bevel = array.modifiers.new('Magnet edge breaks','BEVEL')
bevel.width = .005
bevel.segments = 2
# Pouch cell inside. Outer foil, labels and terminals
rounded('Lithium polymer pouch',(2.36,2.72,.29),(0,.24,-.02),.095,silver,'cell')
rounded('Pouch label',(2.19,2.51,.007),(0,.24,.13),.055,paper,'cell')
for side in [-1,1]:
 rounded('Lithium polymer pouch sealed edge',(.055,2.56,.045),(side*1.19,.24,-.03),.018,silver,'cell')
for x in [-.46,.46]:rounded('Cell tab',(.23,.34,.022),(x,-1.18,-.015),.025,metal,'cell')
# PCB and understandable componentry near connection end
rounded('Main PCB',(2.35,.64,.08),(0,-1.52,-.005),.045,green,'board')
# Logical part positions only: exact component layout is not reconstructed.
for name,x,y,w,h in [('Power conversion IC',-.72,-1.45,.30,.20),('Wireless control IC',-.26,-1.46,.30,.22),('Battery protection IC',.18,-1.46,.28,.20),('Power MOSFET',.90,-1.47,.17,.18)]:
 rounded(name,(w,h,.07),(x,y,.07),.018,black,'board')
cylinder('Power conversion inductor',.14,.11,(.56,-1.47,.09),black,'board',verts=40)
for i in range(9):
 x=-1.02+i*.25;rounded('SMD electronic part',(.12,.07,.035),(x,-1.70,.05),.012,gold if i%3==0 else black,'board')
for i in range(9):
 for side in [-1,1]:
  rounded('SMD electronic part solder termination',(.023,.075,.023),(-1.02+i*.25+side*.057,-1.70,.051),.004,metal,'board')
# Type C socket hole inside metal mouth, at bottom y=-2.08
outer=rounded('USB C receptacle metal',(.40,.16,.13),(0,-1.960,-.015),.055,metal,'port')
cut(outer,rounded('usb interior cutting',(.31,.22,.08),(0,-2.025,-.012),.036,None))
rounded('USB C dark inner',(.30,.018,.065),(0,-2.045,-.012),.022,black,'port')
rounded('USB C inner tongue',(.22,.025,.018),(0,-2.05,-.012),.008,paper,'port')
# indicators and tact button are subtly recessed on front
for y in [-1.70,-1.57,-1.44,-1.31]:cylinder('Status LED',.025,.008,(-1.432,y,0),lens,'button',rotation=(0,math.pi/2,0),verts=32)
cylinder('Button rim',.085,.008,(1.432,-1.52,0),rim,'button',rotation=(0,math.pi/2,0));cylinder('Button insert',.063,.012,(1.437,-1.52,0),white,'button',rotation=(0,math.pi/2,0))
# tiny generic markings; avoid copying brand
# Scale thickness to approximate the verified 102 × 70.6 × 8.6 mm aspect ratio.
for p in parents.values():
 for o in p.children:
  o.location.z *= .62
  o.scale.z *= .62
bpy.ops.object.select_all(action='DESELECT')
for p in parents.values():
 p.select_set(True)
 for o in p.children_recursive:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(__import__('pathlib').Path(__file__).resolve().parents[1] / 'dist/model.glb'),export_format='GLB',use_selection=True,export_apply=True)
