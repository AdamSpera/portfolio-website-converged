<div style="margin-bottom: 2ch;text-transform: none;">
April 24th, 2024</div>

# Getting Started with PHP

This document will go into the basics of how PHP works, and how to implement common processes, like making API calls, getting data with AJAX, and user authentications. Basic web development knowledge is expected, including HTML, CSS, and JavaScript.

# What is PHP?

PHP is a server-side scripting language that is written within the typical HTML file. When you add PHP code to the file, that code is executed and returns the result to the page before it is served to the user. 

When using PHP, all files will end in `.php` instead of `.html`. This is because the server needs to know that there is PHP code in the file that needs to be executed.

By default, files are served by the hierarchy of the file directory. For example, if you have a file structure like this:

<pre>
/includes
  header.php
  footer.php
/configs
  connect.php
index.php
</pre>

When you browse to `yoururl.com/index.php`, the server will look for that file in the root directory. If not specific path is used, it will default to using the `index.php` file.

# Echo

PHP code is written within `<?php` and `?>` tags. This tells the server that the code within these tags is PHP code that needs to be executed.

For example, to print "Hello, World!" to the screen, you would use the following code:

<pre>
echo "Hello, World!";
</pre>

You can use this to do many things, like dynamically generate HTML, interact with databases, and more.

# Include

The `include` statement is used to include a file in the current file. This is useful for including headers, footers, or other files that are used on multiple pages.

For example, to include a header file, you would use the following code:

<pre>
include 'includes/header.php';
</pre>

This will include the `header.php` file in the current file as if it were in that file originally.

# Basic Syntax

PHP is a loosely typed language, meaning that you do not need to declare the type of variable when you create it. You can create a variable like this:

<pre>
$myVariable = "Hello, World!";
</pre>

You can also use single or double quotes to define strings. Single quotes will not parse variables within the string, while double quotes will.

<pre>
$myVariable = 'Hello, World!';
$myVariable = "Hello, $name!";
</pre>

In PHP, you can concatenate strings using the `.` operator. Here's an example:

<pre>
$greeting = "Hello, ";
$name = "World";
$message = $greeting . $name;
$names = "John, Jane, Doe";
$array = explode(", ", $names);
</pre>

# Databases

PHP can interact with databases using the `mysqli` extension. This extension allows you to connect to a database, query the database, and get the results.

<pre>
$conn=new mysqli("localhost", "username", "password", "table");
if(mysqli_connect_errno())
    echo "Connection failed: ".mysqli_connect_error();
</pre>

To query the database, you can use the `query` method on the connection object. Below is an example of a file that will query teh database and create an object for each result:

<pre>
include('../includes/connect.php');
include('../includes/Employee.php');

$sql = "SELECT Name, Phone, Role FROM employees";
$result = $conn->query($sql);

$employeesArray = [];

if ($result && $result->num_rows > 0) {
    
    while ($row = $result->fetch_assoc()) {
        
        $employee = new Employee(
            $row['Name'],
            $row['Phone'],
            $row['Role'],
        );

        $employeesArray[] = $employee->toArray();

    }

} else {
    echo "No employees found.";
    exit;
}

header('Content-Type: application/json');
echo json_encode($employeesArray);
</pre>

# Calling PHP

To call a PHP page result from the front end, you can use AJAX. Below is an example of how to call a PHP page and get the results:

<pre>
$.ajax({
    url: 'getEmployees.php',
    type: 'GET',
    success: function(data) {
        console.log(data);
    },
    error: function(err) {
        console.log(err);
    }
});
</pre>

# PHP Sessions

PHP sessions are used to store data on the server that is associated with a user. This is useful for storing data that needs to be accessed across multiple pages, like user authentication.

To start a session, you can use the `session_start` function. Below is an example of how to start a session and store a user object in the session:

<pre>
session_start();
$_SESSION['user'] = $user;
</pre>

# User Authentication

Since PHP is a server-side language, you can use it to authenticate users before the page is even sent to the user. Below is an example of how to check if a user is logged in and has the correct role:

<pre>
if (!isset($_SESSION['user']) || $_SESSION['user']->role != 'Admin') {
    header('Location: index.php');
    exit;
}
</pre>