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
		if row['Answer.workerId'] == None or len(row['Answer.workerId']) == 0: # done hits
			continue		
	
		video = row['Answer.video']
		counter += 1
		if len(row['Answer.post_json_str']) > 0:
			s = row['Answer.post_json_str']
			json_segs = s.split(';')
			for json_seg in json_segs:
				json_obj = json.loads(json_seg)
				video_name = json_obj['frame_name']
				json_out_path = os.path.join('/var/www/amt/labels', video, video_name.split('.')[0] + '.json')
	#			json_out_path = video_name.split('.')[0] + '.json'
				if not os.path.exists(json_out_path):
					with open(json_out_path, 'w') as out_file:
						json.dump(json_obj, out_file)
		'''
		if len(row['Answer.post_json_str']) == 0:
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
			'''
			#	print out_json_path
			#	with open(out_json_path, 'w') as out_file:
			#		json.dump(labels, out_file)

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
