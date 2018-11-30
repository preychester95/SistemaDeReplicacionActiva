#! /bin/bash
NUMHIJOS=$1
echo "El numero de procesos es: "$NUMHIJOS
	
gnome-terminal --tab --title="Router: RRToHandler" -e "node --no-deprecation router-router-RRToHandler.js 9000 9001 " 
gnome-terminal --tab --title="Router: HandlerToReplica" -e  "node --no-deprecation router-router-HandlerToReplica.js 9002 9003" 
cd Prepare_scripts/
gnome-terminal --tab --title="Replicas" -e "node --no-deprecation prepare_Replicas.js 10 200 true"
sleep 1
gnome-terminal --tab --title="Manejadores" -e "node --no-deprecation prepare_handlers.js 5 500 false"
sleep 1
cd ..
gnome-terminal --tab --title="TotalOrder" -e "node --no-deprecation TO_module.js 5000"
sleep 1
cd Prepare_scripts/
gnome-terminal --tab --title="RRs" -e "node --no-deprecation prepare_RRs.js 10 9000"
sleep 1
gnome-terminal --tab --title="Clientes" -e "node --no-deprecation prepare_clients.js 50 3000 false"