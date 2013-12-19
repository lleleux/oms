#! /bin/bash


# authorized commands
commands=("status" "start" "stop" "restart")


# display usage
# =============
display_usage() {
	echo "Usage: $0 command process(es)"
	echo -n "Commands: "
	for command in "${commands[@]}"
	do
		echo -n "$command, "
	done
	echo "\n"
}


# check if help
# =============
if [[ ( $1 == "--help") ||  $1 == "-h" ]]
then
	display_usage
	exit 0
fi


# check minimum params
# ====================
if [ $# -lt 2 ]
then
	echo "All the arguments are required."
	display_usage
	exit 1
fi

# get command
# ===========

command=$1
shift


# check if the command exists
# ===========================
found=false
for search in "${commands[@]}"
do
	if [[ ${search} =~ ^"$command"$ ]]
	then
		found=true
	fi
done
if [ $found == false ]
then
	echo "The command does not exist."
	display_usage
	exit 1
fi


# display usage if the script is not run as root user
if [ $EUID -ne 0 ]
then
	echo "This script must be run with super-user privileges."
	display_usage
	exit 1
fi


# Status
if [ $command == 'status' ]
then
	echo "{"
	for service in "$@"
	do
		echo "\"$service\": {"
		case $service in
			oms-*)
				service $service status | awk '$4 == "stopped" { print "\"status\": \"stopped\""} $4 == "running" { print "\"status\": \"running\",\n\"pid\": \""$7"\""}'
				;;
			mongodb)
				service $service status | awk '$2 == "stop/waiting" { print "\"status\": \"stopped\""} $2 == "start/running," { print "\"status\": \"running\",\n\"pid\": \""$4"\""}'
				;;
			*)
				;;
		esac
		[ $service == ${@: -1} ] && echo "}" || echo "},"
	done
	echo "}"
fi


# Start
if [ $command == 'start' ]
then
	echo "{"
	for service in "$@"
	do
		echo "\"$service\": {"
		case $service in
			oms-*)
				service $service start | awk '$3 == "[Fail]" { print "\"status\": \"fail\""} $3 == "[OK]" { print "\"status\": \"ok\""}'
				;;
			mongodb)
				service $service start 2>&1 | awk '$2 != "start/running," { print "\"status\": \"fail\""} $2 == "start/running," { print "\"status\": \"ok\""}'
				;;
			*)
				;;
		esac
		[ $service == ${@: -1} ] && echo "}" || echo "},"
	done
	echo "}"
fi


# Stop
if [ $command == 'stop' ]
then
	echo "{"
	for service in "$@"
	do
		echo "\"$service\": {"
		case $service in
			oms-*)
				service $service stop | awk '$3 == "[Fail]" { print "\"status\": \"fail\""} $3 == "[OK]" { print "\"status\": \"ok\""}'
				;;
			mongodb)
				service $service stop 2>&1 | awk '$2 != "stop/waiting" { print "\"status\": \"fail\""} $2 == "stop/waiting" { print "\"status\": \"ok\""}'
				;;
			*)
				;;
		esac
		[ $service == ${@: -1} ] && echo "}" || echo "},"
	done
	echo "}"
fi


# Restart
if [ $command == 'restart' ]
then
	echo "{"
	for service in "$@"
	do
		echo "\"$service\": {"
		case $service in
			oms-*)
				service $service restart | awk '$3 == "[Fail]" { print "\"status\": \"fail\""} $3 == "[OK]" { print "\"status\": \"ok\""}'
				;;
			mongodb)
				service $service restart 2>&1 | tail -n 1 | awk '$2 != "start/running," { print "\"status\": \"fail\""} $2 == "start/running," { print "\"status\": \"ok\""}'
				;;
			*)
				;;
		esac
		[ $service == ${@: -1} ] && echo "}" || echo "},"
	done
	echo "}"
fi

exit 0