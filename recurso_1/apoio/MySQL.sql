CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `books` (`id`, `title`) VALUES
(1, 'The Very Hungry Caterpillar');

-- --------------------------------------------------------

CREATE TABLE `booksGenres` (
  `bookId` int(11) NOT NULL,
  `genreName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `booksGenres` (`bookId`, `genreName`) VALUES
(1, 'Children\'s literature'),
(1, 'Fiction');

-- --------------------------------------------------------

CREATE TABLE `genres` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `genres` (`name`) VALUES
('Children\'s literature'),
('Fiction');

-- --------------------------------------------------------

CREATE TABLE `instances` (
  `id` int(11) NOT NULL,
  `status` enum('Available','Booked','Maintenance') NOT NULL,
  `bookedBy` varchar(255) DEFAULT NULL,
  `returnDate` datetime DEFAULT NULL,
  `bookId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `instances` (`id`, `status`, `bookedBy`, `returnDate`, `bookId`) VALUES
(1, 'Available', NULL, NULL, 1),
(2, 'Maintenance', NULL, NULL, 1);

-- --------------------------------------------------------
-- Indexes for table `books`
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `booksGenres`
  ADD PRIMARY KEY (`bookId`,`genreName`),
  ADD KEY `genreName` (`genreName`);

ALTER TABLE `genres`
  ADD PRIMARY KEY (`name`);

ALTER TABLE `instances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookId` (`bookId`);

-- AUTO_INCREMENT 
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `instances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- Constraints 
ALTER TABLE `booksGenres`
  ADD CONSTRAINT `booksGenres_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `booksGenres_ibfk_2` FOREIGN KEY (`genreName`) REFERENCES `genres` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `instances`
  ADD CONSTRAINT `instances_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
