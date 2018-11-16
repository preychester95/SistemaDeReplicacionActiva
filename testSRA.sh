#! /bin/bash
NUMHIJOS=$1
echo "El numero de procesos es: "$NUMHIJOS
	
gnome-terminal --tab -e "node router-router-RRToHandler.js 9000 9001 S" 
gnome-terminal --tab -e  "node router-router-HandlerToReplica.js 9002 9003 S" 
cd Prepare_scripts/
gnome-terminal --tab -e "node prepare_Replicas.js 3"
sleep 1
gnome-terminal --tab -e "node prepare_handlers.js 10"
sleep 1
cd ..
gnome-terminal --tab -e "node TO_module.js 5000"
sleep 1
cd Prepare_scripts/
gnome-terminal --tab -e "node prepare_RRs.js 30 9000"
sleep 1
gnome-terminal --tab -e "node prepare_clients.js"