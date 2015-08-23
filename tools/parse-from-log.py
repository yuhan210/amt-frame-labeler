import json
import csv
import sys
import os


def modify_error_json(s):
	#{ gt_labels :  525-0-holding ,  525-2-wearing ,  525-3-shirt ,  525-4-person ,  525-9-electric guitar ,  525-9-guitar ,  525-11-white ,  frame_NAME :  525.jpg ,  video_NAME :  14_year_old_girl_playing_guitar_cover_van_halen__eruption_solo_hd_best_quality_fDTm1IzQf-U }

	segs = s.split('{ ')[1].split(' }')[0].split(',')
	video_name = segs[-1].split(':')[-1].strip()
	frame_name = segs[-2].split(':')[-1].strip()
	
	segs[0] = segs[0].split(':')[-1].strip()
	label_segs = segs[:-2]

	print label_segs, video_name, frame_name


if __name__ == "__main__":

	if len(sys.argv) != 2:
		print 'Usage:', sys.argv[0], 'turker.results'	
		exit(-1)


	csv_file = open(sys.argv[1])
	csv_reader = csv.DictReader(csv_file, delimiter="\t")

	for row in csv_reader:
		if len(row['Answer.post_json_str']) == 0:
			continue		
		for l in row['Answer.post_json_str'].split(';'):
			try:
				json_obj = json.loads(l)
			except ValueError:
				modify_error_json(l)
				continue	
			#print json_obj['frame_name']
			video_name = json_obj['video_name']

				
			json_name = json_obj['frame_name'].split('.')[0] + '.json'
			out_json_path = os.path.join('/var/www/amt/labels', video_name, json_name)
			if os.path.exists(out_json_path):
				continue
			print out_json_path
			with open(out_json_path, 'w') as out_file:
				json.dump(json_obj, out_file)
