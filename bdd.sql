/*
SQLyog Community Edition- MySQL GUI v7.02 
MySQL - 5.5.5-10.1.13-MariaDB : Database - belote
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/`belote` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `belote`;

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `sess_id` varbinary(128) NOT NULL,
  `sess_data` blob NOT NULL,
  `sess_lifetime` mediumint(9) NOT NULL,
  `sess_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`sess_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Data for the table `sessions` */

insert  into `sessions`(`sess_id`,`sess_data`,`sess_lifetime`,`sess_time`) values ('jeqvi4u2smn2lg6rc78ovtngh4','_sf2_attributes|a:1:{s:4:\"user\";O:8:\"stdClass\":2:{s:2:\"id\";s:1:\"0\";s:4:\"name\";s:4:\"heri\";}}_sf2_flashes|a:0:{}_sf2_meta|a:3:{s:1:\"u\";i:1467723731;s:1:\"c\";i:1467721805;s:1:\"l\";s:1:\"0\";}',1440,1467723731);

/*Table structure for table `site_session` */

DROP TABLE IF EXISTS `site_session`;

CREATE TABLE `site_session` (
  `sid` text NOT NULL,
  `userid` mediumint(9) NOT NULL,
  `last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip` varchar(15) NOT NULL,
  `browser` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `site_session` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` mediumint(9) unsigned NOT NULL AUTO_INCREMENT,
  `active` text NOT NULL,
  `date` datetime NOT NULL,
  `last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `username` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  `email` varchar(100) NOT NULL,
  `country` varchar(50) NOT NULL,
  `gender` varchar(1) NOT NULL,
  `birthday` date NOT NULL,
  `avatar` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `users` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
