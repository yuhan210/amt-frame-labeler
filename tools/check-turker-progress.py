import sys
import os

if __name__ == "__main__":

	if len(sys.argv) != 2:
		print 'Usage:', sys.argv[0], 'turker.input'
		exit(-1)


	tasks = open(sys.argv[1]).read().split()
	for idx, task in enumerate(tasks):
		if idx == 0:
			continue
		#print task.split('&')
		video_name = task.split('&')[0]	
		frame_names = task.split('&')[1].split('=')[1].split(';')

		frame_paths = [os.path.join('/var/www/amt/labels', video_name, x.split('.')[0] + '.json') for x in frame_names]

		for frame_path in frame_paths:
			#print frame_path
			if not os.path.exists(frame_path):
				print 'Not labeled:', video_name, frame_path.split('/')[-1]
