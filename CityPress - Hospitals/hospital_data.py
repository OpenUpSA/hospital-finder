import sys
import fnmatch
import os
import csv
import re
import json
import argparse

def print_csv(data, fieldnames, fname):
	with open(fname, 'wb') as csvfile:
		csvwriter = csv.DictWriter(csvfile, fieldnames)
		csvwriter.writeheader()
		csvwriter.writerows(data)
	print "All done"

def clean_data_point(s):
	if (s.upper() == "NONE"):
		s = ""
	if (s.upper() == "N/A"):
		s = ""
	if (s.upper() == "0"):
		s = ""
	return s

def find_data_point(data, start_str, end_str):
	if (data.find(start_str) == -1):
		return ""
	start_pos = data.find(start_str) + len(start_str)
	end_pos = data.find(end_str, start_pos)
	result = data[start_pos:end_pos].strip()
	result = clean_data_point(result)
	return result

def find_table(data, tablename):
	result = []
	# Find our table
	start_pos = re.search("\s(.*)" + tablename, data).start()
	end_pos = data.find("\n\n", start_pos)
	table = data[start_pos:end_pos].strip()

	# Split into lines
	lines = table.split("\n");
	# First line is our keys
	keys = lines.pop(0)
	#Split this up
	p = re.compile("\s\s+")
	keys = p.split(keys)

	#First item is our domain
	# domain = keys.pop(0)

	# Split up each individual line
	for line in lines:
		tmp = {}
		parts = p.split(line)
		# name = parts.pop(0)
		for key in keys:
			if (isinstance(parts, list) and (len(parts) > 0)):
				# result[domain + "." + name + "." + key] = parts.pop(0)
				tmp[key] = parts.pop(0)
		result.append(tmp)
	return result

def find_score(data, tablename):
	result = {}
	table = find_table(data, tablename)
	for row in table:
		if (row.has_key("Score")):
			name = row[tablename]
			score = row["Score"]
			result[name] = score
	return result

def find_dualline_data_point(data, start_str):
	return find_data_point(data, start_str + "\n\n", "\n\n")

def get_meta_data(parts):
	data_dict = {}
	data_dict["name"] = find_dualline_data_point(parts[0], "Facility:")
	data_dict["area_type"] = find_data_point(parts[1], "Surrounding Area: ", "GPS -").upper()
	data_dict["street_address"] = find_dualline_data_point(parts[1], "Street Address")
	data_dict["postal_address"] = find_dualline_data_point(parts[1], "Postal Address")
	data_dict["postal_area"] = find_dualline_data_point(parts[1], "Postal Area")
	data_dict["tel"] = find_dualline_data_point(parts[1], "Telephone number")
	data_dict["cel"] = find_dualline_data_point(parts[1], "Cell number")
	data_dict["fax"] = find_dualline_data_point(parts[1], "Fax number")
	data_dict["manager"] = find_dualline_data_point(parts[1], "Manager Name")
	data_dict["email"] = find_dualline_data_point(parts[1], "Email address")
	data_dict["classification"] = find_dualline_data_point(parts[3], "Facility Classified")
	data_dict["ownership"] = find_dualline_data_point(parts[3], "Ownership")
	p = re.compile('GPS - (.*)\n')
	d = re.compile('[-+]?[0-9]*\.?[0-9]+')
	# print parts[1]
	gps = p.findall(parts[1])
	# gps_parts = d.findall(gps.pop())
	# gps = gps[len("Latitude: "): len(gps)]
	(data_dict["latitude"], data_dict["longitude"]) = d.findall(gps.pop())
	# data_dict["longitude"] = gps[gps.find(",") + len(", Longitude:"):len(gps)]
	return data_dict

def find_coloned_data_point(data, s):
	result = re.search(s + ": (\w.*)", data)
	if result:
		return result.group(1)
	return ""

def get_meta_data_report(data, result):
	result["facility"] = find_coloned_data_point(data, "Facility")
	result["province"] = find_coloned_data_point(data, "Province")
	result["district"] = find_coloned_data_point(data, "District")
	result["sub_district"] = find_coloned_data_point(data, "Sub-District")
	return result

def initial_clean(data):
	data = re.sub('Private and Confidential. Report for:\n\n\d\|P a g e\n\nSemi-Permanent Data', '', data)
	data = re.sub('Private and Confidential. Report for:\n\n', '', data)
	data = re.sub('\d\|P a g e\n\n', '', data)
	return data

def initial_clean_report(data):
	# data = re.sub('Private and Confidential. Report for: \w.*\n\n\d?\s?\|\s?P a g e\n\n\w*.\n', '=====', data)
	data = re.sub('Private and Confidential. \w.*\n', '', data)
	# data = re.sub('Private and Confidential. Report for: \w.*\n\n', '', data)
	# data = re.sub('\d?\s?\|\s?P a g e\n\n', '', data)
	data = re.sub('\w.*\n', '', data)
	data = re.sub('\n\s+Feedback Report \(Area\)\n', '', data)
	return data

def overall_score_report(data, result):
	result["score"] = {}
	result["score"]["measures"] = {}
	found = re.search('Overall Performance\s+Outcome\s+(\d+%)', data)
	if found:
		result["score"]["overall_performance"] = found.group(1)
	found = re.search('Non-Compliance Cut-Off Levels\s+Overall Score\s+Extreme Measure.*\s\s\w+\s=(.*)\nVital Measures.*\s\s\w+\s=(.*)\nEssential Measures.*\s\s\w+\s=(.*)\nDevelopmental Measures.*\s\s\w+\s=(.*)\n', data)
	if found:
		(result["score"]["measures"]["extreme_measures"], result["score"]["measures"]["vital_measures"], result["score"]["measures"]["essential_measures"], result["score"]["measures"]["developmental_measures"]) = found.group(1), found.group(2), found.group(3), found.group(4)
	return result

def split_parts(data):
	# max_parts
	parts = []
	part_count = 0
	end_pos = 0
	while(end_pos > -1):
		end_pos = data.find("\n" + str(part_count + 1) + ".")
		s = data[0:end_pos]
		data = data[end_pos:]
		part_count = part_count + 1
		parts.append(s)
	return parts

def get_staff_data(data):
	data = re.sub('2. Staffing\nStaffing Information\nType\n\nFull Time\n\nPart Time\n\nVacant\n\n', '', data)
	# print data
	p = re.compile('\w.*\n\n\d*\n\n\d*\n\n\d*\n\n')
	d = re.compile('\d+')
	i = p.finditer(data)
	item_template = { "full_time": 0, "part_time": 0, "vacant": 0 }
	items = {}
	for el in i:
		s = el.string[el.start():el.end()]
		item = item_template.copy()
		type_name = s[0:s.find("\n")]
		(item["full_time"], item["part_time"], item["vacant"]) = d.findall(s)[:3]
		items[type_name] = item
		# items.append(item)
	return items

def get_accom_data(data):
	data = re.sub("4. Accommodation\nAccommodation Details\nElement\n*Value", '', data)
	p = re.compile('\w.*\n\n\d*\n\n')
	d = re.compile('\d+')
	i = p.finditer(data)
	items = {}
	for el in i:
		s = el.string[el.start():el.end()]
		type_name = s[0:s.find("\n")]
		items[type_name] = int(d.findall(s).pop())
	return items

def get_hours(data):
	data = re.sub("5. Hours of Operation\nHours of Operation Details\nElement\n*Value", '', data)
	p = re.compile('\w.*\n\n\w.*\n\n')
	d = re.compile('\w.*\n')
	i = p.finditer(data)
	items = {}
	# print data
	for el in i:
		s = el.string[el.start():el.end()]
		type_name = s[0:s.find("\n")]
		items[type_name] = d.findall(s).pop().strip()
	return items

def get_gov(data):
	data = re.sub("6. Governance\nGovernance\nElement\nValue (%)", '', data)
	p = re.compile('\w.*\n\n\d*\n\n')
	d = re.compile('\d+')
	i = p.finditer(data)
	items = {}
	for el in i:
		s = el.string[el.start():el.end()]
		type_name = s[0:s.find("\n")]
		items[type_name] = int(d.findall(s).pop())
	return items

def tables_report(data, result):
	tmp = find_score(data, "Priority Area")
	result["priority_area"] = tmp;
	# result = dict(result.items() + tmp.items())
	tmp = find_score(data, "Domain")
	result["domain"] = tmp;
	# result = dict(result.items() + tmp.items())
	return result

def process_report_file(fname, data_list):
	fname = fname.replace("ba_facprofile_", "cs_feedback_rep_area_")
	if (not os.path.isfile(fname)):
		return
	f = open(fname, "r")
	data = f.read()
	f.close()
	data = initial_clean_report(data)
	result = {}
	result = get_meta_data_report(data, result)
	result = overall_score_report(data, result)
	result = tables_report(data, result)
	
	# print overall_score
	data_list.append(result)

def process_file(fname, data_list):
	field_list = []
	f = open(fname, "r")
	data = f.read()
	f.close()
	data = initial_clean(data)
	parts = split_parts(data)
	result = get_meta_data(parts)
	try:
		result["staff"] = get_staff_data(parts[2])
		result["accommodation"] = get_accom_data(parts[4])
		result["hours"] = get_hours(parts[5])
		result["governance"] = get_gov(parts[6])
		# result = process_report_file(fname, result)
		data_list.append(result)
	except IndexError:
		print "Problem with ", fname
	
def process_both(fname, data_list):
	feedback = []
	profile = []
	profile_filename = fname.replace("cs_feedback_rep_area_", "ba_facprofile_")
	feedback_filename = fname.replace("ba_facprofile_", "cs_feedback_rep_area_")
	if (os.path.isfile(profile_filename) and os.path.isfile(feedback_filename)):
		process_file(profile_filename, profile)
		process_report_file(feedback_filename, feedback)
		result = dict(profile.pop().items() + feedback.pop().items())
		uid = os.path.splitext(os.path.basename(fname.replace("cs_feedback_rep_area_", "")))[0]
		result["uid"] = uid
		data_list.append(result)
	# else:
	# 	if (os.path.isfile(profile_filename)):
	# 		print "Missing ", feedback_filename
	# 	else:
	# 		print "Missing ", profile_filename

if __name__ == "__main__":
	parser = argparse.ArgumentParser(description='Rips data kicking and screaming from SA hospital PDFs')
	parser.add_argument('--format', help='format output as json or csv (default: csv)', default="csv")
	parser.add_argument('--output', help='save to this file', default="output.csv")
	parser.add_argument('--file', help='select a file to parse. can also be a directory')
	parser.add_argument('--type', help='profile, feedback or both', default='feedback')
	args = parser.parse_args()
	if (args.type == "profile"):
		procfilter = "ba_facprofile_*.txt"
	elif (args.type == "feedback"):
		procfilter = "cs_feedback_*.txt"
	else:
		procfilter = "cs_feedback_*.txt"
	# Find the filename we want to read
	# file_pattern = sys.argv[1]
	data_list = []
	field_list = []
	if (os.path.isdir(args.file)):
		for root, dirnames, filenames in os.walk(args.file):
			for filename in fnmatch.filter(filenames, procfilter):
				if (args.type == "both"):
					process_both(os.path.join(root, filename), data_list)
				elif (re.match("ba_", filename)):
					process_file(os.path.join(root, filename), data_list)
				else:
					process_report_file(os.path.join(root, filename), data_list)
	else:
		fname = args.file
		if (args.type == "profile"):
			process_file(fname, data_list)
		else:
			process_report_file(fname, data_list)
	if (args.format == "csv"):
		for key in data_list.keys():
			field_list.append(key)
		print print_csv(data_list, field_list, args.output)
	elif (args.format == "json"):
		print json.dumps(data_list)