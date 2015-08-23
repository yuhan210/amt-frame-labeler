import sys

if __name__ == "__main__":

	if len(sys.argv) != 2:
		print 'Usage:'. sys.argv[0], 'video_list'
		exit(-1)
	
	video_list = open(sys.argv[1]).read().split()
	start_idx = 1
	end_idx = 1	

	

