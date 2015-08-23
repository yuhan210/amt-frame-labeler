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


def read_suggested_labels(video, frame_name):
	
	anno_json_path = os.path.join('/var/www/amt/annos', video, frame_name.split('.')[0] + '.json')
	with open(anno_json_path) as data_file:
		data = json.load(data_file)
		return data['choices']

if __name__ == "__main__":

	if len(sys.argv) != 2:
		print 'Usage:', sys.argv[0], 'turker.results'	
		exit(-1)


	csv_file = open(sys.argv[1])
	csv_reader = csv.DictReader(csv_file, delimiter="\t")
	counter = 0
	for row in csv_reader:
		if len(row['Answer.workerId']) == 0: # done hits
			continue		
	
		counter += 1
		if len(row['Answer.post_json_str']) == 0:
			'''
			4783-1-person,4783-3-girl,409-0-woman,409-2-man,409-8-chainlink fence,409-10-person,409-11-boy,409-14-young,2327-14-pole,2327-13-high,2726-0-person,2726-3-pole,2726-8-volleyball,2726-10-beach,2726-11-people,2726-12-woman,2726-13-beautiful,1598-0-woman,1598-1-umbrella,1598-2-man,1598-11-person,1171-1-group,1171-2-people,1171-8-volleyball,1171-10-person,1171-11-bikini,1171-12-front,1171-13-girls,1171-14-standing,2303-none,3956-1-girl,3956-10-person,3956-13-front,3956-14-people,174-6-chainlink fence,174-10-fence,174-11-outdoor,174-12-people,174-13-pole,174-14-girl,6641-6-volleyball,6641-9-sky,6641-10-cloudy
			'''
			selections = row['Answer.selections'].split(',')
			frame_names = row['Answer.frame_names'].split(';')
			video = row['Answer.video']
			#print row
			for frame_name in frame_names:
				labels = {}
				labels['frame_name'] = frame_name
				labels['video_name'] = video
				labels['gt_labels'] = []
				sug_labels = read_suggested_labels(video, frame_name)
				fid = frame_name.split('.')[0]
				for selection in selections:
					if selection.split('-')[0] == fid:
						
						m_labels = []
						row_id = selection.split('-')[1]
						if row_id == 'none':
							m_labels += [selection]
							labels['gt_labels'] += [m_labels]
							break

						sug_segs = sug_labels[row_id].split('->')
						label = selection.split('-')[2]
						matched = False
						for s in sug_segs:
							if label == s:
								matched = True
							if matched:
								m_labels += [fid + '-' + row_id + '-' + s]
								print m_labels
						labels['gt_labels'] += [m_labels]
			
				out_json_path = os.path.join('/var/www/amt/labels/', video, frame_name.split('.')[0] + '.json')
			#	print out_json_path
				with open(out_json_path, 'w') as out_file:
					json.dump(labels, out_file)

		'''
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
			print 'Has post_json_str but not logged in server.', out_json_path
			#with open(out_json_path, 'w') as out_file:
			#	json.dump(json_obj, out_file)
		'''
	print counter
