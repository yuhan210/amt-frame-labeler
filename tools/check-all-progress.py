import sys
import os

if __name__ == "__main__":

	'''
	if len(sys.argv) != 2:
		print 'Usage:'. sys.argv[0], 'video_list'
		exit(-1)
	
	'''
	
	anno_path = '/var/www/amt/annos'
	
	n_keyframe = 0
	for folder in os.listdir(anno_path):
		if folder == 'README':
			continue

		n_keyframe += len(os.listdir(os.path.join(anno_path, folder)))


	label_path = '/var/www/amt/labels'
	
	n_labeledframes = 0
	for folder in os.listdir(label_path):
		if folder == 'README':
			continue
		
		n_labeledframes += len(os.listdir(os.path.join(label_path, folder)))

	print 'Label progress'
	print n_labeledframes, '/' , n_keyframe, (n_labeledframes/(n_keyframe* 1.0)) * 100
