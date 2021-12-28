<?php

    $STATIC_APP = getenv("STATIC_APP");
    $DYNAMIC_APP = getenv("DYNAMIC_APP");


?>

 <VirtualHost *:80>
        ServerName demo.res.ch

        ProxyPass '/api/students/' 'http://<?php print ("$DYNAMIC_APP") ?>/test/'
        ProxyPassReverse '/api/students/' 'http://<?php print ("$DYNAMIC_APP") ?>/test/'

        ProxyPass '/' 'http://<?php print ("$STATIC_APP") ?>/'
        ProxyPassReverse '/' 'http://<?php print ("$STATIC_APP") ?>/'

</VirtualHost>
