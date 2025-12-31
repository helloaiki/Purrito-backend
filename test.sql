CREATE TABLE Student
(
    Student_name VARCHAR(20),
    Student_id INTEGER,
    PRIMARY KEY(Student_Id)
);


INSERT INTO Student(Student_name,Student_id) VALUES('Jimmy',1);


SELECT *
FROM Student;

DROP TABLE Student;