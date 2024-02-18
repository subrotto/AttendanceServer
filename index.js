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

    //post
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