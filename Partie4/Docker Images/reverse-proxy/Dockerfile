FROM php:7.2-apache
COPY conf/ /etc/apache2

RUN apt-get update && apt-get install -y vim

RUN a2enmod proxy proxy_http
RUN a2ensite 000* 001*
