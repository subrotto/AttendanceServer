//subrotokumargunopu
//PeMH4Pw67DYcFahl
const { MongoClient } =require("mongodb");
const express=require('express');
const cors=require('cors');
const ObjectId=require('mongodb').ObjectId;
const app=express();
const port=5000;


app.use(cors());
app.use(express.json());

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb+srv://subrotokumargunopu:PeMH4Pw67DYcFahl@cluster0.1d6cqlp.mongodb.net/?retryWrites=true&w=majority";


// Create a new client and connect to MongoDB
const client = new MongoClient(uri);


  

async function run() {
  try {
      await client.connect();
      const db = client.db('attendance');
    const coursesCollection = db.collection('courses');
    const classesCollection = db.collection('classes');
    const studentsCollection = db.collection('students');
     const courseAssignmentsCollection = db.collection('courseAssignments');

    //post

    //admin
    app.post('/addAdminCourse', async (req, res) => {
      try {
        const { courseName } = req.body;
        const result = await courseAssignmentsCollection.insertOne({ courseName, students: [] });
        res.json({ message: `Course ${courseName} added with ID: ${result.insertedId}` });
      } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

//admin
    app.get('/getAdminCourses', async (req, res) => {
      try {
        const courses = await courseAssignmentsCollection.find().toArray();
        res.json({ courses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
//admin
    app.post('/assignStudentToCourse', async (req, res) => {
      try {
        
        const { courseId, studentId } = req.body;
        console.log(studentId)
        const studentData = { studentId:studentId, quiz: null, mid: null, final: null };
        console.log(studentId)
        const result = await courseAssignmentsCollection.updateOne(
          { _id: new ObjectId(courseId) },
          { $push: { students: studentData } }
        );
        res.json({ message: `Student ${studentId} assigned to course with ID: ${courseId}` });
      } catch (error) {
        console.error('Error assigning student to course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    //admin
    app.get('/getAdminStudents/:courseId', async (req, res) => {
      try {
        const courseId = req.params.courseId;
        const course = await courseAssignmentsCollection.findOne({ _id: new ObjectId(courseId) });
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ students: course.students });
      } catch (error) {
        console.error('Error fetching students for course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    //admin
    app.get('/getAdminStudent/:courseId/:studentId', async (req, res) => {
      try {
        const { courseId, studentId } = req.params;
        const course = await courseAssignmentsCollection.findOne({ _id: new ObjectId(courseId), "students.studentId": studentId });
        if (!course) {
          return res.status(404).json({ error: 'Student not found in course' });
        }
        const student = course.students.find(student => student.studentId === studentId);
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ student });
      } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

//admin
app.post('/updateStudentScores', async (req, res) => {
  try {
    const { courseId, studentId, quiz, mid, final } = req.body;
    const result = await courseAssignmentsCollection.updateOne(
      { _id: new ObjectId(courseId), "students.studentId": studentId },
      { $set: { "students.$.quiz": quiz, "students.$.mid": mid, "students.$.final": final } }
    );
    res.json({ message: `Scores updated for student ${studentId} in course with ID: ${courseId}` });
  } catch (error) {
    console.error('Error updating student scores:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//admin
app.get('/getCourse/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await courseAssignmentsCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//admin
app.get('/getStudentIdsByCourseName/:courseName', async (req, res) => {
  try {
    const courseName = req.params.courseName;
    const course = await courseAssignmentsCollection.findOne({ courseName: courseName });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const studentIds = course.students.map(student => student.studentId);
    res.json({ studentIds });
  } catch (error) {
    console.error('Error fetching student IDs by course name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//stuadmin
app.get('/getCoursesWithScores/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const courses = await courseAssignmentsCollection.find().toArray();

    const coursesWithScores = courses.map(course => {
      const student = course.students.find(student => student.studentId === studentId);
      if (student) {
        return {
          courseName: course.courseName,
          quiz: student.quiz,
          mid: student.mid,
          final: student.final
        };
      }
      return null;
    }).filter(course => course !== null); // Filter out courses where the student is not enrolled

    res.json({ courses: coursesWithScores });
  } catch (error) {
    console.error('Error fetching courses with scores:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



    app.post('/addCourse', async (req, res) => {
      try {
        const { courseName,userEmail } = req.body;
        const result = await coursesCollection.insertOne({ name: courseName, email:userEmail,classes: [] });
        res.json({ message: `Course ${courseName} added with ID: ${result.insertedId} for email ${userEmail}` });
      } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/addClass/:courseId', async (req, res) => {
      try {
        const courseId = req.params.courseId;
        const { date } = req.body;



        
        console.log(date)
        const classDate = new Date(date);


       
    
    // Increase the date by one day
    classDate.setDate(classDate.getDate() + 1);

    const shortenedDate = classDate.toISOString().slice(0, 10);
       
        const classResult = await classesCollection.insertOne({ name: shortenedDate, students: [] });
        await coursesCollection.updateOne({ _id:new ObjectId(courseId) }, { $push: { classes: classResult.insertedId } });
        res.json({ message: `Class ${shortenedDate} added to course with ID: ${courseId}` });
      } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/addStudent/:classId', async (req, res) => {
      try {
        const classId = req.params.classId;
        const { text } = req.body;
          const findStudent=await studentsCollection.findOne({ student_ID: text })
         
            const studentResult = await studentsCollection.insertOne({ student_ID: text });
            await classesCollection.updateOne({ _id:new ObjectId(classId) }, { $push: { students: studentResult.insertedId } });
            res.send({ message: `Student  added to class with ID: ${classId}` });
            console.log(req.body)
          
        
      } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    //get

    app.get('/getCoursesByStudent/:studentId', async (req, res) => {
      try {
        const studentId = req.params.studentId;
    
        // Find all student documents with the given student ID
        const students = await studentsCollection.find({ student_ID: studentId }).toArray();
    
        if (students.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
    
        // Find all classes that contain any of the found student IDs
        const classIds = await classesCollection.distinct('_id', { students: { $in: students.map(student => student._id) } });
    
        if (classIds.length === 0) {
          return res.status(404).json({ error: 'Student not found in any class' });
        }
    
        // Retrieve the courses associated with the found classes
        const courses = await coursesCollection.find({ classes: { $in: classIds } }).toArray();
    
        // Return the courses
        res.json({ courses });
      } catch (error) {
        console.error('Error fetching courses by student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    

    app.get('/getClassesByStudent/:studentId', async (req, res) => {
      try {
        const studentId = req.params.studentId;
    
        // Find all student documents with the given student ID
        const students = await studentsCollection.find({ student_ID: studentId }).toArray();
    
        if (students.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
    
        // Find all classes that contain any of the found student IDs
        const classIds = await classesCollection.distinct('_id', { students: { $in: students.map(student => student._id) } });
    
      
    
        // Return an array of class IDs
        res.json({ classIds });
      } catch (error) {
        console.error('Error fetching classes by student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    
    
    

    
   
    app.get('/getCourses/:courseId',async(req,res)=>{
      const courseId=req.params.courseId;
      const query={_id:new ObjectId(courseId)};
      const course = await coursesCollection.findOne(query);
      res.send(course);
    })
    app.get('/getClasses/:classId',async(req,res)=>{
      
      const classId=req.params.classId;
      const query={_id:new ObjectId(classId)};
      const classes = await classesCollection.findOne(query);
      res.send(classes);
    })
    app.get('/getStudents/:studentId',async(req,res)=>{
      
      const studentId=req.params.studentId;
      const query={_id:new ObjectId(studentId)};
      const students = await studentsCollection.findOne(query);
      res.send(students);
    })

    app.get('/getClasses', async (req, res) => {
      try {
        const classes = await classesCollection.find().toArray();
        res.json({ classes });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/getCourses', async (req, res) => {
      try {
        const courses = await coursesCollection.find().toArray();
        res.json({ courses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/getStudents', async (req, res) => {
      try {
        const students = await studentsCollection.find().toArray();
        res.json({ students });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/getUniqueStudentIds', async (req, res) => {
      try {
        // Find all unique student IDs
        let uniqueStudentIds = await studentsCollection.distinct('student_ID');
    
        // Sort the student IDs numerically
        uniqueStudentIds.sort((a, b) => parseInt(a) - parseInt(b));
    
        // Return the unique student IDs as an array
        res.json({ studentIds: uniqueStudentIds });
      } catch (error) {
        console.error('Error fetching unique student IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    


    app.get('/getStudentsByClass/:classId', async (req, res) => {
      try {
        const classId = req.params.classId;
        const query = { _id: new ObjectId(classId) };
        const classInfo = await classesCollection.findOne(query);
    
        if (!classInfo) {
          return res.status(404).json({ error: 'Class not found' });
        }
    
        // Retrieve the student IDs associated with the class
        const studentIds = classInfo.students;
    
        // Retrieve the student details for the retrieved student IDs
        const students = await studentsCollection.find({ _id: { $in: studentIds } }).toArray();
    
        res.json({ students });
      } catch (error) {
        console.error('Error fetching students by class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/getAllDetails', async (req, res) => {
      try {
        const courses = await coursesCollection.find().toArray();
        
        const detailedCourses = await Promise.all(courses.map(async (course) => {
          const classDetails = await Promise.all(course.classes.map(async (classId) => {
            const classInfo = await classesCollection.findOne({ _id: new ObjectId(classId) });
            const studentDetails = await Promise.all(classInfo.students.map(async (studentId) => {
              const studentInfo = await studentsCollection.findOne({ _id: new ObjectId(studentId) });
              return {
                student_ID: studentInfo.student_ID,
                _id: studentInfo._id
              };
            }));
            return {
              classId: classInfo._id,
              className: classInfo.name,
              students: studentDetails
            };
          }));
          return {
            courseId: course._id,
            courseName: course.name,
            email: course.email,
            classes: classDetails
          };
        }));
        
        res.json({ detailedCourses });
      } catch (error) {
        console.error('Error fetching all details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    app.get('/getCoursesAndClassesByStudent/:studentId', async (req, res) => {
      try {
        const studentId = req.params.studentId;
    
        // Find all student documents with the given student ID
        const students = await studentsCollection.find({ student_ID: studentId }).toArray();
    
        if (students.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
    
        // Find all classes that contain any of the found student IDs
        const classIds = await classesCollection.distinct('_id', { students: { $in: students.map(student => student._id) } });
    
        if (classIds.length === 0) {
          return res.status(404).json({ error: 'Student not found in any class' });
        }
    
        // Retrieve the class details
        const classDetails = await classesCollection.find({ _id: { $in: classIds } }).toArray();
    
        // Retrieve the courses associated with the found classes
        const courseIds = await coursesCollection.distinct('_id', { classes: { $in: classIds } });
        const courseDetails = await coursesCollection.find({ _id: { $in: courseIds } }).toArray();
    
        // Map the class details to their respective courses
        const coursesWithClasses = courseDetails.map(course => {
          return {
            courseId: course._id,
            courseName: course.name,
            classes: classDetails.filter(cls => course.classes.includes(cls._id)).map(cls => ({
              classId: cls._id,
              className: cls.name,
            }))
          };
        });
    
        // Return the courses and classes attended by the student
        res.json({ courses: coursesWithClasses });
      } catch (error) {
        console.error('Error fetching courses and classes by student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    
   // Endpoint to get courses and class attendance by student ID
// Endpoint to get courses and class attendance by student ID
// Endpoint to get courses and class attendance by student ID
app.get('/getCoursesAndAttendance/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find all student documents with the given student ID
    const students = await studentsCollection.find({ student_ID: studentId }).toArray();
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find all classes that the student attended
    const attendedClassIds = await classesCollection.distinct('_id', { students: { $in: students.map(student => student._id) } });

    // Find all courses that have classes attended by the student
    const courseIds = await coursesCollection.distinct('_id', { classes: { $in: attendedClassIds } });
    const courses = await coursesCollection.find({ _id: { $in: courseIds } }).toArray();

    // Prepare the response: For each course, count total classes and attended classes by the student
    const coursesWithAttendance = await Promise.all(courses.map(async (course) => {
      const courseClassIds = course.classes.map(classId => new ObjectId(classId));
      const totalClasses = await classesCollection.countDocuments({ _id: { $in: courseClassIds } });
      const attendedClasses = await classesCollection.countDocuments({ _id: { $in: attendedClassIds }, _id: { $in: courseClassIds }, students: { $in: students.map(student => student._id) } });
      
      return {
        courseId: course._id,
        courseName: course.name,
        totalClasses,
        attendedClasses
      };
    }));

    res.json({ coursesWithAttendance });
  } catch (error) {
    console.error('Error fetching courses and attendance by student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


    
    
   
    

    
  } finally {
     // Close the MongoDB client connection
    // await client.close();
  }
}
// Run the function and handle any errors
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('connected');
});

app.listen(port,()=>{
    console.log('running server on port',port);
});