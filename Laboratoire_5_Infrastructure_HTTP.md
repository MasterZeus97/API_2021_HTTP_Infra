# Laboratoire 5 : Infrastructure HTTP

## Step 1: Static HTTP server with apache httpd

### 1. Contenu du Dockerfile

```dockerfile
FROM php:7.2-apache
COPY src/ /var/www/html/
```

Pour remplir notre Dockerfile, nous avons suivi les indication données dans la vidéo en utilisant une distribution de apache avec php déjà installé. Nous avons cependant utilisé la version recommandée sur le hub docker plutôt que la version montrée dans les vidéos.

### 2. Création d'un site statique

Dans le contenu copié dans le Dockerfile, nous pouvons voir que le contenu du répertoire src est copié dans le répertoire /var/www/html de l'image. Ce chemin correspond à l'emplacement ou on stock le contenu statique utilisé par le serveur http.

Nous avons donc créer un dossier src au même niveau que notre Dockerfile, et nous avons utilisé [ce framework](https://startbootstrap.com/theme/grayscale) dont nous avons copié le contenu dans le dossier src.

### 3. Création de l'image

Afin de pouvoir faire tourner le site, il faut maintenant créer une image. Il faut donc utiliser cette commande afin de créer une nouvelle image docker à partir du Dockerfile :

```dockerfile
docker build -t res/apache_php .
```

Attention, il faut être dans le même répertoire que le dockerfile pour que cette commande s'exécute correctement. A chaque fois que l'on modifie un élément qui est stocké dans l'image (ici il n'y a pour l'instant que la page html), il faudra refaire cette commande afin de rebuild l'image. 

### 4. Création d'un container

Afin de pouvoir accéder à la page html stockée dans l'image, il faut que nous lancions un container à partir de cette image, grâce à la commande suivante : 

```dockerfile
docker run -d --name apache_php res/apache_php
```

Pour tester si tout fonctionne, il faut aller récupérer l'adresse du container :

```
docker inspect apache_php | grep -i ipadd
```

Nous pouvons maintenant accéder à la page web en entrant l'adresse suivante dans un navigateur

```
#Linux
adresse_ip
```

### 5. Accéder aux configurations du serveur apache pendant que le container tourne

Afin de visualiser la configuration du serveur apache, il faut entrer la commande 

```dockerfile
docker exec -it apache_php /bin/bash
```

afin d'entrer dans le container en train de tourner. Une fois dedans, avec la commande 

```
cd /etc/apache2
```

On arrive la où se trouvent les fichiers de configurations. 

## Step 2: Dynamic HTTP server with express.js

### 1. Contenu du Dockerfile

```dockerfile
FROM node:17-alpine3.12
COPY src/express /opt/app
CMD ["node", "/opt/app/index.js"]
```

Comme on peut le voir à la commande de copie, nous allons avoir besoin d'un dossier src/express afin d'y stocker des choses, il faut donc créer un fichier src au même niveau que le Dockerfile. Le dossier express viendra par la suite.

### 2. Installation de NodeJS

Puisque nous allons faire du java script, nous installons NodeJS, qui installe par la même occasion npm, qui sera lui utile pour installer toutes les dépendance nécessaire au fonctionnement d'une librairie.

### 3. Création d'une application NodeJS

Pour commencer une nouvelle application NodeJS, nous avons entrer les commandes suivante:

```
npm init
	package name : node
	version : 0.1.0
	description : 
npm install --save chance
npm install --save express
```

Tout les fichiers/dossiers ainsi générés doivent être placés dans le dossier src.

### 4. Créer un code NodeJS dynamique

Pour créer un code dynamique NodeJS, il faut aller dans  le dossier express.js. Ici, dans le fichier index.js, nous avons codé une application qui retourne une phrase composée de mot aléatoire grâce à Chance. 

### 5. Test du script

Afin de tester le script lancé dans un container, il faut build l'image. Comme indiqué dans le point 3 de l'étape 1, il faut construire une image afin de pouvoir lancer un container. 

```dockerfile
docker build -t res/express_quote .
```

 Puis, on lance un container à l'aide de la commande 

```dockerfile
docker run -d --name express_quote res/express_quote
```

Pour tester si tout fonctionne, il faut aller récupérer l'adresse du container :

```
docker inspect express_quote | grep -i ipadd
```

Ensuite, on peut essayer ces deux adresses

```
#Linux
adresse_ip:3000
```

Ici, on doit avoir le message "Quote of the day!" qui s'affiche (avec notre code).

```
#Linux
adresse_ip:3000/quote
```

Ici, une "phrase", ou plutôt une suite de mots sans rapport doit s'afficher. Il s'agit d'une phrase générée aléatoirement par Chance.

## Step 3: Reverse proxy with apache (static configuration)

Ici, nous voulons créer un reverse proxy hard codé, c'est à dire que nous allons sauvegarder les adresses ip auxquelles le proxy doit se connecter dans l'image docker directement. Cela veut dire que dès qu'on souhaitera changer une des ip auquel le reverse proxy se connecte, il faudra rebuild l'image.

### 1.Contenu du Dockerfile

```dockerfile
FROM php:7.2-apache
COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

On voit qu'ici, nous avons besoin d'un dossier conf. Nous y mettrons les fichiers qui nous permettront de configurer le serveur apache en reverse proxy. Les 2 commandes run permettent de lancer un script qui activera les configuration des différents fichiers de configuration.

Nous allons aussi lancer les deux commande suivantes dès maintenant afin d'avoir les deux containers auxquels nous accèderons à l'aide du proxy.

```dockerfile
docker run -d --name apache_static res/apache_php
```

```dockerfile
docker run -d --name express_dynamic res/express_quote
```

### 2. Création des fichiers de configuration

Nous allons donc créer 2 fichiers de configuration (le troisième fichier qu'on voit dans le Dockerfile est un fichier déjà présent dans apache). Le premier s'appellera 000-default.conf et le second 001-reverse-proxy.conf. Ces deux fichiers doivent être placé dans le dossier conf/sites-available/.

Le fichier 000-default.conf contient la configuration par défaut du serveur, qui permet au proxy de savoir quoi accéder quand le client ne spécifie pas la ressource à laquelle il veut accéder.

```
<VirtualHost *:80>
</VirtualHost>
```

Le fichier 001-reverse-proxy.conf contient les informations nécessaire pour configurer le reverse proxy statique. C'est dans ce fichier que nous allons écrire les adresses des container qu'on souhaite accéder.

```
 <VirtualHost *:80>
        ServerName proxy.httpinfra.ch

        #ErrorLog ${APACHE_LOG_DIR}/error.log
        #CustomLog ${APACHE_LOG_DIR}/access.log combined

        ProxyPass "/api/quote/" "http://172.17.0.3:3000/quote/"
        ProxyPassReverse "/api/quote/" "http://172.17.0.3:3000/quote/"

        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"

</VirtualHost>
```

Cette manière de configurer un proxy ne peut pas être considérer bonne, elle est même très mauvaise, puisque les adresses ip des containers sont écrites en durs dans un fichier qui est copié dans l'image. Cela veut dire que, si on ne lance pas les container correctement, ou qu'il y a trop de containers déjà lancé, adresse des containers sera différentes. Il faudra donc changer ce fichier et rebuild l'image.

### 3. Créer l'image

```dockerfile
docker build -t res/apache_rp .
```

### 4. Lancer un container

```dockerfile
docker run -d --name apache_rp res/apache_rp
```

### 5. Fichier host

Afin de pouvoir accéder aux deux sites, il faut que l'on modifie le fichier hosts afin de pouvoir utiliser un DNS. Sur Linux, le chemin d'accès pour le fichier hosts est le suivant : `/etc/hosts`.

Il faut ensuite récupérer l'**adresse ip** du container afin de le lier au nom de domaine:

```
docker inspect apache_rp | grep -i ipadd  
```

Ensuite, on ajoute la ligne `adresse_ip proxy.httpinfra.ch`. On peut maintenant accéder au site en local via le nom de domaine.

### 6. Accès à la page web

Nous pouvons maintenant accéder à la page web en entrant le nom de domaine dans un navigateur

Accès au serveur statique :

```
#Linux
proxy.httpinfra.ch
```

Accès au serveur dynamique :

```
#Linux
proxy.httpinfra.ch/api/quote
```

## Step 4: AJAX requests with JQuery

Afin que ce step fonctionne bien, il faut, comme à la partie 3, lancer 3 container, 1 avec l'image res/apache_php pour afficher le site, 1 avec l'image res/express_quote afin de pouvoir utiliser le script fait plus tôt, et 1 avec res/apache_rp afin de pouvoir se connecter aux deux autres site au travers du proxy. Cf. partie 3 pour les commandes et les mise en garde.

Dans cette partie, nous devons faire une requête AJAX dans notre page web. Pour ce faire, il faut mettre cette requête dans le body de la page :

```html
<!-- Custom script to load quote-->
<script src="js/quote.js"></script>
```

Elle permet de faire appel au script de création de phrase aléatoire afin d'obtenir une phrase. Nous avons également modifié cette ligne de code se trouvant dans le masterhead, juste en dessous du titre :

```html
<h2 class="text-white-50 mx-auto mt-2 mb-5">Site pour le labo 5 d'API</h2>
```

en

```html
<h2 id="quote" class="text-white-50 mx-auto mt-2 mb-5">Site pour le labo 5 d'API</h2>
```

afin d'afficher la phrase que l'on récupère. Et comme cette requête est envoyée à intervalle régulier, la phrase change régulièrement.

<u>**Remarque:**</u> Il faut rebuild l'image du serveur apache_php avant de pouvoir voir les effet de ce changement (voir step 1 pour la commande).

## Step 5: Dynamic reverse proxy configuration

Cette étape se passe dans le dossier reverse proxy, nous ne parlerons donc que de fichier se trouvant dans ce dossier. Cependant, comme à la partie 3 et 4, il faut lancer 3 container. Cf step 3 et 4 pour plus d'indications.

### 1. Modification du Dockerfile

Pour ce step, il faut modifier le Dockerfile du reverse proxy.

```dockerfile
FROM php:7.2-apache

RUN apt-get update && apt-get install -y vim

COPY apache2-foreground /usr/local/bin/
COPY templates /var/apache2/templates
COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*

CMD ["apache2-foreground"]
```

avec les deux copie de fichier/dossier que nous avons ajouté, nous allons pouvoir gérer les adresses ip auxquelles se connectera le proxy grâce à des paramètre que nous donnerons à chaque containers séparément.

### 2. apache2-foreground

A la fin du dockerfile de l'image php:7.2-apache, une commande exécute ce fichier afin de lancer apache en foreground et non en background comme c'est habituellement le cas. Cela permet d'éviter que le container se termine immédiatement. Il va nous permettre de récupérer des paramètres que nous passeront lors du lancement du container et que nous stockerons dans des variable d'environnement créées pour ça. Nous allons donc modifier ce fichier afin qu'il puisse réaliser cela. 

Pour commencer, nous avons créé un fichier apache2-foreground au même niveau que le Dockerfile du reverse proxy. Dedans, nous copions ce que contient déjà le fichier apache2-foreground de l'image et nous ajoutons le code suivant dedans :

```
echo "Setup for API lab:"
echo "Static App URL: $STATIC_APP"
echo "Dynamic App URL: $DYNAMIC_APP"
php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf
```

Ce fichier nécessite une modification des droits d'exécution, une chose qui n'est pas possible à faire sous Windows. Nous avons donc utilisé une machine sous linux afin de pouvoir run la commande `chmod 755 apache2-foreground`. C'est à cause de cette commande, non reconnue par Windows, que nous avons fait ce step uniquement sur linux. 

### 3. Ajout de la configuration selon les paramètres passés au lancement

Tout d'abord, nous créons un dossier templates au même niveau que le Dockerfile, et dans ce dossier, nous créons un fichier config-template.php qui contiendra la configuration des ip grâce au code suivant :

```php
<?php

    $STATIC_APP = getenv("STATIC_APP");
    $DYNAMIC_APP = getenv("DYNAMIC_APP");


?>

 <VirtualHost *:80>
        ServerName proxy.httpinfra.ch

        ProxyPass '/api/quote/' 'http://<?php print ("$DYNAMIC_APP") ?>/quote/'
        ProxyPassReverse '/api/quote/' 'http://<?php print ("$DYNAMIC_APP") ?>/quote/'

        ProxyPass '/' 'http://<?php print ("$STATIC_APP") ?>/'
        ProxyPassReverse '/' 'http://<?php print ("$STATIC_APP") ?>/'

</VirtualHost>
```

Ce code php, très semblable à celui utilisé dans le fichier 001-reverse-proxy.conf, permet en soit de faire la même chose que ce dernier, mais sans avoir d'adresse écrite en dur, les adresse étant récupérer grâce aux variable d'environnement créées dans apache2-foreground.

### 4. Test du serveur proxy configuré dynamiquement

Pour tester ces modifications, il faut tout d'abord rebuild l'image du reverse proxy (voir step 3 pour la commande). Ensuite, on peut utiliser la commande suivante pour lancer ce reverse proxy :

```
docker run -d -e STATIC_APP=172.17.0.x:80 -e DYNAMIC_APP=172.17.0.x:3000 --name apache_rp res/apache_rp
```

## Step 6: Load balancing
### 1. Choix de l'image

Pour cette étape, nous avons choisi d'utiliser comme image "Traefik", qui servira comme reverse proxy et qui implémente le load balancing. L'utilisation de traefik est plutôt simple et très intéressante parce qu'elle permet, via un docker-compose, de récupérer les adresses des différents containers dynamiquement et de faire les liaisons.

### 2. Configuration du docker-compose

```dockerfile
version: "3.7"

services:
  traefik:
    image: "traefik:v2.5"
    container_name: "traefik"
    hostname: "traefik"
    # active le dashboard
    command:
     - "--api.insecure=true"
     - "--api.dashboard=true"
     - "--providers.docker"
     - "--log.level=DEBUG"
    ports:
     - "80:80"
     - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    
  apachephp: #
    build: 
      context: ./apache-php-image # //chemin du dockerfile
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.apachephp.rule=Host(`proxy.httpinfra.ch`)"
      - "traefik.http.services.dynamicServices.loadbalancer.sticky.cookie=true"


  expressimage: #
    build: # //chemin du dockerfile
      context: ./express-image
    labels:
      - "traefik.http.routers.expressimage.rule=Host(`proxy.httpinfra.ch`) && Path(`/api/quote/`)"
      - "traefik.http.middlewares.dynamic_replace_path.replacepath.path=/"
      - "traefik.http.routers.expressimage.middlewares=dynamic_replace_path"
      - "traefik.http.services.dynamic_service.loadbalancer.sticky.cookie.name=expressimage"
```

Le docker-compose est séparé en 3 parties, une partie configurant l'image Traefik, une configurant le site statique et une pour les données dynamiques.

Nous avons activé le dashboard dans l'implémentation afin de pouvoir accéder à la gestion visuelle de Traefik via une page web, mais elle n'est pas obligatoire, il est donc possible de le désactiver si pas utilisé : 

```dockerfile
- "--api.dashboard=false"
```

Pour la partie statique et dynamique, nous devons indiquer le chemin des dockerfile créé dans les étapes précédentes, afin que le docker-compose les ajoute à notre configuration.

```dockerfile
build: # //chemin du dockerfile
      context: ./express-image
```

Pour la configuration de traefik sur nos deux containers, nous allons leur rajouter des labels.  Ces labels serviront à router un nom de domaine ainsi qu'un chemin spécifique (si précisé) au container en question. Par exemple, dans la partie statique, on lie le container à la racine du nom de domaine "proxy.httpinfra.ch". On rajoute au final les cookies au deux serveurs via les dernières lignes de chaque partie labels des containers.

### 3. Lancer le docker-compose

```
docker-compose up -d
```

Il faut se trouver dans le même répertoire que le fichier docker-compose pour lancer cette commande.

### 4. Fichier host

Afin de pouvoir accéder aux deux sites, il faut que l'on modifie le fichier hosts afin de pouvoir utiliser un DNS. Sur Linux, le chemin d'accès pour le fichier hosts est le suivant : `/etc/hosts`.

Il faut ensuite récupérer l'**adresse ip** du container afin de le lier au nom de domaine:

```
docker inspect traefik | grep -i ipadd  
```

Ensuite, on ajoute la ligne `adresse_ip proxy.httpinfra.ch`. On peut maintenant accéder au site en local via le nom de domaine.

### 5. Accès à la page web

Nous pouvons maintenant accéder à la page web en entrant le nom de domaine dans un navigateur

Accès au serveur statique :

```
#Linux
proxy.httpinfra.ch
```

Accès au serveur dynamique :

```
#Linux
proxy.httpinfra.ch/api/quote
```