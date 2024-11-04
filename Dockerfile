FROM php:7.4-apache

# Set PHP configuration to production
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Enable rewrite
RUN a2enmod rewrite

# Import App
COPY .htaccess index.php styles.css copy.js script.js markdown.js history.js favicon.ico notes.htaccess clippy.svg /var/www/html/
COPY public/js /var/www/html/js/

# Add build argument for UID and GID
ARG UID=1000
ARG GID=1000

# Modify www-data user
RUN usermod -u ${UID} www-data && groupmod -g ${GID} www-data \
    && mkdir -p /var/www/html/_tmp \
    && chown -R www-data:www-data /var/www/html

# Set entrypoint for permissions
COPY minimalist-web-notepad-entrypoint /usr/local/bin/
RUN chmod +x /usr/local/bin/minimalist-web-notepad-entrypoint

ENTRYPOINT ["minimalist-web-notepad-entrypoint"]
CMD ["apache2-foreground"]