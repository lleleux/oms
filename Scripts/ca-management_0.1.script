#!/bin/bash

# TODO	Check if the second part of an argument is present before doing shift 2
# 		Use CONFIG file for init commands (create self-signed cert)
#		Check the return code of the openssl commands



#---------------------
# Usage help function
#---------------------

function usage {
echo "
USAGE:
	$0 command [options]

DESCRIPTION:
	This script is used to manage a CA

COMMANDS:
	init-ca
	init-agent
	revoke

OPTIONS:
	all
		-h, --help
				Show this message
		--ca-dir=DIR
				The CA directory, where everything is kept
		--ca-key-password=PASSWORD
				Set the CA private key password. Default: no password
	init-ca
		--ca-cert-filename=FILENAME
				Set the CA certificate filename in the CA directory. Default: ca.crt
		--ca-key-filename=FILENAME
				Set the CA private key filename in the CA directory. Default: ca.key
		--cert-validity=DAYS
				Set the certificate validity duration for all the generated certificates. Default: 365
		--crl-days=DAYS
				Set the CRL maximum days. Default: 30
		--serial=NUMBER
				Set the first serial number that will be used for making certificates. Default: 01
	init-agent
		--agent-id
				The id of the agent for which a key and a certificate must be created.
	revoke
		--crl-filename
				The filename of the generated CRL. Default: ca.crl
"
}



#---------------------------
# Get command and arguments
#---------------------------

COMMAND=$1
shift
CA_DIR=
CA_CONFIG_FILENAME=ca.cnf
CA_CERT_FILENAME=ca.crt
CA_KEY_FILENAME=ca.key
CA_KEY_PASSWORD=
CERT_VALIDITY=365
CRL_DAYS=30
CRL_FILENAME=ca.crl
SERIAL=01
AGENT_ID=
while [ $# -gt 0 ]; do
	case "$1" in
		--ca-dir)				CA_DIR=$2;				shift 2;;
		--ca-cert-filename)		CA_CERT_FILENAME=$2;	shift 2;;
		--ca-key-filename)		CA_KEY_FILENAME=$2;		shift 2;;
		--ca-key-password)		CA_KEY_PASSWORD=$2;		shift 2;;
		--cert-validity)		CERT_VALIDITY=$2;		shift 2;;
		--crl-days)				CRL_DAYS=$2;			shift 2;;
		--crl-filename)			CRL_FILENAME=$2;		shift 2;;
		--serial)				SERIAL=$2;				shift 2;;
		--agent-id)				AGENT_ID=$2;			shift 2;;
		-h|--help)				usage;					exit 0;;
		*)						usage;					exit 1;;
	esac
done



#----------------------
# Create a config file
#----------------------

function init-ca-cnf {
echo "
[ ca ]
default_ca = oms-ca

[ oms-ca ]
dir				= ${CA_DIR}				# Where everything is kept
certs			= \$dir/certs			# Where the issued certs are kept
database		= \$dir/index.txt		# database index file.
new_certs_dir	= \$dir/newcerts		# default place for new certs.

certificate		= \$dir/${CA_CERT_FILENAME}		# The CA certificate
serial			= \$dir/serial 					# The current serial number
crl				= \$dir/crl.pem 				# The current CRL
private_key		= \$dir/${CA_KEY_FILENAME}		# The private key

default_days		= ${CERT_VALIDITY}		# how long to certify for
default_crl_days	= ${CRL_DAYS}			# how long before next CRL
default_md			= md5					# which md to use.
preserve			= no					# keep passed DN ordering

policy		= policy_match

[ policy_match ]
countryName				= match
stateOrProvinceName		= match
organizationName		= match
organizationalUnitName	= optional
commonName				= supplied
emailAddress			= optional

[ policy_anything ]
countryName				= optional
stateOrProvinceName		= optional
localityName			= optional
organizationName		= optional
organizationalUnitName	= optional
commonName				= supplied
emailAddress			= optional
" > ${CA_DIR}/${CA_CONFIG_FILENAME}
}



#--------
# Checks
#--------

# Check if the password for the CA key matches
function check-password {
	if [ -f "${CA_DIR}/${CA_KEY_FILENAME}" ]; then
		openssl rsa -noout -in ${CA_DIR}/${CA_KEY_FILENAME} -passin pass:${CA_KEY_PASSWORD} 2> /dev/null
		if [ $? -ne 0 ]; then
			if [ -z "${CA_KEY_PASSWORD}" ]; then
				echo "A password is required for the CA private key !"
			else
				echo "Wrong password for the CA private key!"
			fi
			exit 1
		fi
	fi
}

# Check if the certificate exists
function check-certificate-exists {
	if [ ! -r "${CA_DIR}/certs/${AGENT_ID}.crt" ]; then
		echo "The agent has no certificate yet !"
		exit 2
	fi
}

# Check if the certificate is revoked
function check-certificate-not-revoked {
	if [ `cat ${CA_DIR}/index.txt | grep /CN=${AGENT_ID} | head -c 1` == R ]; then
		echo "The agent certificate is revoked !"
		exit 3
	fi
}

# Check if agent-id is given
function check-agent-id {
	if [ -z "${AGENT_ID}" ]; then
		echo "Agent-id is required !"
		exit 4
	fi
}

# Check if agent already has a certificate
function check-has-no-certificate {
	# Check if agent already has a certificate
	if [ -f "${CA_DIR}/certs/${AGENT_ID}.crt" ]; then
		echo "The agent has already a certificate !"
		exit 5
	fi
}



#-----------------
# Check the usage
#-----------------

# Check if the command is given
if [ -z "${COMMAND}" ]; then
	echo "No command provided !"
	exit 1
fi
# Check if the CA_DIR is given
if [ -z "${CA_DIR}" ]; then
	echo "--ca-dir option is required !"
	exit 1
fi



#---------------------
# Execute the command
#---------------------

case "${COMMAND}" in

	# Initialize the CA with a config file, a key, a certificate...
	"init-ca")
		# Checks
		check-password
		# Create ca.cnf
		init-ca-cnf
		# Create private key with or without password
		if [ -z "${CA_KEY_PASSWORD}" ]; then
			openssl genrsa -out ${CA_DIR}/${CA_KEY_FILENAME} 2048 &> /dev/null
		else
			openssl genrsa -aes256 -out ${CA_DIR}/${CA_KEY_FILENAME} -passout pass:${CA_KEY_PASSWORD} 2048 &> /dev/null
		fi
		# Create a self-signed certificate for this key
		openssl req -new -x509 -sha256 -days ${CERT_VALIDITY} -key ${CA_DIR}/${CA_KEY_FILENAME} -passin pass:${CA_KEY_PASSWORD} -out ${CA_DIR}/${CA_CERT_FILENAME} -subj '/CN=CN/O=OO/C=CC/L=LL/ST=ST/'
		# Create an index.txt file
		touch ${CA_DIR}/index.txt
		# Create a serial file
		echo ${SERIAL} > ${CA_DIR}/serial
		# Create the directories
		mkdir ${CA_DIR}/certs
		mkdir ${CA_DIR}/newcerts
		;;

	# Initialize a new agent by creating him a private key, a certificate... Returns the private key on stdout and don't store it.
	"init-agent")
		# Checks
		check-password
		check-agent-id
		check-has-no-certificate
		# Create a directory for temporary files
		mkdir ${CA_DIR}/${AGENT_ID}
		# Make a private key
		openssl genrsa -out ${CA_DIR}/${AGENT_ID}/agent.key 2048 &> /dev/null
		# Make a certificate request
		openssl req -sha256 -new -key ${CA_DIR}/${AGENT_ID}/agent.key -out ${CA_DIR}/${AGENT_ID}/agent.csr -subj "/CN=${AGENT_ID}/O=OO/C=CC/L=LL/ST=ST/" 2> /dev/null
		# Sign the certificate request
		if [ -z "${CA_KEY_PASSWORD}" ]; then
			openssl ca -batch -notext -config ${CA_DIR}/${CA_CONFIG_FILENAME} -in ${CA_DIR}/${AGENT_ID}/agent.csr -out ${CA_DIR}/certs/${AGENT_ID}.crt 2> /dev/null
		else
			openssl ca -batch -notext -config ${CA_DIR}/${CA_CONFIG_FILENAME} -in ${CA_DIR}/${AGENT_ID}/agent.csr -out ${CA_DIR}/certs/${AGENT_ID}.crt -passin pass:${CA_KEY_PASSWORD} 2> /dev/null
		fi
		# Output the agent key and clear the temporary files
		cat ${CA_DIR}/${AGENT_ID}/agent.key
		cat ${CA_DIR}/certs/${AGENT_ID}.crt
		rm -rf ${CA_DIR}/${AGENT_ID}
		;;

	# Revoke the agent certificate and generate the CRL with the new revoked certificate.
	"revoke")
		# Checks
		check-password
		check-certificate-exists
		# Revoke the certificate and generate CRL
		openssl ca -revoke ${CA_DIR}/certs/${AGENT_ID}.crt -config ${CA_DIR}/${CA_CONFIG_FILENAME} -passin pass:${CA_KEY_PASSWORD} 2> /dev/null
		openssl ca -gencrl -config ${CA_DIR}/${CA_CONFIG_FILENAME} -passin pass:${CA_KEY_PASSWORD} -out ${CA_DIR}/${CRL_FILENAME} 2> /dev/null
		;;

	# Default when the command is not recognized
	*)
		echo "Invalid command !"
		exit 1
		;;

esac

exit 0