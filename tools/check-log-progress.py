import json
import csv
import sys
import os


if __name__ == "__main__":

	if len(sys.argv) != 2:
		print 'Usage:', sys.argv[0], 'turker.results'	
		exit(-1)

	csv_file = open(sys.argv[1])
	csv_reader = csv.DictReader(csv_file, delimiter="\t")
	counter = 0
	turker_labeled_frame_count = 0
	logged_frame_count = 0
	json_logged_count = 0
	for row in csv_reader:
		if row['Answer.workerId'] == None or len(row['Answer.workerId']) == 0: # done hits
			continue		
	
		counter += 1
		if len(row['Answer.post_json_str']) > 0:
			json_logged_count += 1
		selections = row['Answer.selections'].split(',')
		frame_names = row['Answer.frame_names'].split(';')
		turker_labeled_frame_count += len(frame_names)
		video = row['Answer.video']
		for frame_name in frame_names:
			if os.path.exists(os.path.join('/var/www/amt/labels', video, frame_name.split('.')[0] + '.json')):
				logged_frame_count += 1

	print 'Correctly posted to the server:'
	print logged_frame_count, '/' , turker_labeled_frame_count, (logged_frame_count/(turker_labeled_frame_count * 1.0)) * 100
	print 'Correctly post json to amt:'
	print json_logged_count, '/' , counter, (json_logged_count/(counter * 1.0)) * 100
