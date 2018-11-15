#! /bin/bash
NUMHIJOS=$1
echo "El numero de procesos es: "$NUMHIJOS
gnome-terminal --tab -e "node router-router-HandlerToReplica.js 9002 9003 S" 
gnome-terminal --tab -e "node router-router-RRToHandler.js 9000 9001 S" 
gnome-terminal --tab -e "node ~/Prepare_scripts/prepare_Replicas.js 1"
sleep 5
gnome-terminal --tab -e "node ~/Prepare_scripts/prepare_handlers.js 1"
sleep 5
gnome-terminal --tab -e "node TO_module.js 5000"
sleep 5
gnome-terminal --tab -e "node ~/Prepare_scripts/prepare_RRs.js 1 9000"
sleep 5
gnome-terminal --tab -e "node ~/Prepare_scripts/prepare_clients.js"