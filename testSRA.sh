#! /bin/bash
NUMHIJOS=$1
echo "El numero de procesos es: "$NUMHIJOS
	
gnome-terminal --tab --title="Router: RRToHandler" -e "node router-router-RRToHandler.js 9000 9001 S" 
gnome-terminal --tab --title="Router: HandlerToReplica" -e  "node router-router-HandlerToReplica.js 9002 9003 S" 
cd Prepare_scripts/
gnome-terminal --tab --title="Replicas" -e "node prepare_Replicas.js 3 3000 false"
sleep 1
gnome-terminal --tab --title="Manejadores" -e "node prepare_handlers.js 3 3000 false"
sleep 1
cd ..
gnome-terminal --tab --title="TotalOrder" -e "node TO_module.js 5000"
sleep 1
cd Prepare_scripts/
gnome-terminal --tab --title="RRs" -e "node prepare_RRs.js 3 9000"
sleep 1
gnome-terminal --tab --title="Clientes" -e "node prepare_clients.js 3 3000 false"