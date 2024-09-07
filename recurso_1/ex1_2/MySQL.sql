use recurso_Ex;

-- Dropar as Foreign Keys
ALTER TABLE `booksGenresRecurso` DROP FOREIGN KEY `booksGenres_ibfk_1`;
ALTER TABLE `booksGenresRecurso` DROP FOREIGN KEY `booksGenres_ibfk_2`;
ALTER TABLE `instancesRecurso` DROP FOREIGN KEY `instances_ibfk_1`;

-- Dropar as Tabelas
DROP TABLE IF EXISTS `booksGenresRecurso`;
DROP TABLE IF EXISTS `instancesRecurso`;
DROP TABLE IF EXISTS `booksRecurso`;
DROP TABLE IF EXISTS `genresRecurso`;

CREATE TABLE `booksRecurso` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `booksRecurso` (`id`, `title`) VALUES
(1, 'The Very Hungry Caterpillar');

-- --------------------------------------------------------

CREATE TABLE `booksGenresRecurso` (
  `bookId` int(11) NOT NULL,
  `genreName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `booksGenresRecurso` (`bookId`, `genreName`) VALUES
(1, 'Children\'s literature'),
(1, 'Fiction');

-- --------------------------------------------------------

CREATE TABLE `genresRecurso` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `genresRecurso` (`name`) VALUES
('Children\'s literature'),
('Fiction');

-- --------------------------------------------------------

CREATE TABLE `instancesRecurso` (
  `id` int(11) NOT NULL,
  `status` enum('Available','Booked','Maintenance') NOT NULL,
  `bookedBy` varchar(255) DEFAULT NULL,
  `returnDate` datetime DEFAULT NULL,
  `bookId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `instancesRecurso` (`id`, `status`, `bookedBy`, `returnDate`, `bookId`) VALUES
(1, 'Available', NULL, NULL, 1),
(2, 'Maintenance', NULL, NULL, 1);

-- --------------------------------------------------------
-- Indexes for table `booksRecurso`
ALTER TABLE `booksRecurso`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `booksGenresRecurso`
  ADD PRIMARY KEY (`bookId`,`genreName`),
  ADD KEY `genreName` (`genreName`);

ALTER TABLE `genresRecurso`
  ADD PRIMARY KEY (`name`);

ALTER TABLE `instancesRecurso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookId` (`bookId`);

-- AUTO_INCREMENT 
ALTER TABLE `booksRecurso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `instancesRecurso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- Constraints 
ALTER TABLE `booksGenresRecurso`
  ADD CONSTRAINT `booksGenres_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `booksRecurso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `booksGenres_ibfk_2` FOREIGN KEY (`genreName`) REFERENCES `genresRecurso` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `instancesRecurso`
  ADD CONSTRAINT `instances_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `booksRecurso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

