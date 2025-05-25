CREATE TABLE `ingredients` (
  `id` INTEGER NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `type` enum('base','topping','dressing') NOT NULL,
  `savings` int(11) NOT NULL,
  PRIMARY KEY (`id`)) ENGINE=InnoDB;


INSERT INTO `ingredients` (`id`, `name`, `type`, `savings`) VALUES
(1, 'Lettuce', 'base', 4),
(2, 'Arugula', 'base', 0),
(3, 'Pasta penne', 'base', 2),
(4, 'Tomato', 'topping', 2),
(5, 'Tuna', 'topping', 0),
(6, 'Vinaigrette', 'dressing', 2),
(7, 'Bearnaise', 'dressing', 0);


CREATE TABLE `orders` (
  `id` INTEGER NOT NULL auto_increment,
  `status`ENUM('received', 'making', 'ready', 'picked', 'canceled'),
  `student` INTEGER NOT NULL, 
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
PRIMARY KEY (`id`)) ENGINE=InnoDB;



CREATE TABLE `ingredients_per_order` (
  `orderId` int(11) NOT NULL,
  `ingredientId` int(11) NOT NULL,
PRIMARY KEY  (`orderId`,`ingredientId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `ingredients_per_order`
  ADD CONSTRAINT `ingredients_per_order_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ingredients_per_order_ibfk_2` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
