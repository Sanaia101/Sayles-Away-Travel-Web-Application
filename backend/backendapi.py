from flask import Flask, request, session
from flask_cors import CORS

from sql import create_connection
from sql import execute_read_query
from sql import execute_update_query

from creds import creds

import secrets

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

# Create the variables that store the gmail address and gmail address password from which form data is sent from.
sender_gmail = os.getenv('sender_gmail')
email_password = os.getenv('email_password')

app = Flask(__name__)
app.config["DEBUG"] = True

app.config['SECRET_KEY'] = secrets.token_hex(16)

CORS(app, origins="http://localhost:8080")

# Function to check whether a client's email is already in the database.
def check_if_client_exists(email):
    sql = f"select * from client where email = '{email}'"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return len(result) > 0

# Function to insert a client's information into the database.
def insert_new_client(first_name, last_name, email):
    sql = f"insert into client (first_name, last_name, email) values ('{first_name}', '{last_name}', '{email}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

# Function to retrieve a client's data from the database using their email.
def find_client(email):
    sql = f"select client_id from client where email = '{email}'"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return result

# Function to insert contact form information into the database.
def insert_contact_info(client_id, subject, message):
    sql = f"insert into contact (client_id, subject, message) values ({client_id}, '{subject}', '{message}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

# Function to retrieve the most recent contact form information from the database.
def find_contact():
    sql = f"select * from contact where contact_id = (select max(contact_id) from contact)"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return result

# Function to retrieve client information from the database using their client_id.
def find_client_by_id(id):
    sql = f"select * from client where client_id = {id}"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return result

# Function to send an email using a hardcoded email (dotenv variables) along with client and contact form information retrieved from the database.
def send_email(to_email, subject, message):
    msg = MIMEMultipart()
    msg['From'] = sender_gmail
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(message, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_gmail, email_password) 
        text = msg.as_string()
        server.sendmail(sender_gmail, to_email, text)
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Function to insert inquiry information into the database.
def insert_inquiry_info(client_id, email, first_name, last_name, destination, departure, start_date, end_date, is_passport_valid, num_travelers, underage_travelers, accommodations, rooms, payment_date, atmosphere, budget, activities, reference):
    sql = f"insert into travel_inquiries (client_id, email, first_name, last_name, destination, departure, start_date, end_date, is_passport_valid, num_travelers, underage_travelers, accommodations, rooms, payment_date, atmosphere, budget, activities, reference) values ({client_id}, '{email}', '{first_name}', '{last_name}', '{destination}', '{departure}', '{start_date}', '{end_date}', '{is_passport_valid}', '{num_travelers}', '{underage_travelers}', '{accommodations}', '{rooms}', '{payment_date}', '{atmosphere}', '{budget}', '{activities}', '{reference}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

# Create a backend path which recieves a post request when the travel inquiry form page is accessed.
@app.route('/travelinquiryform', methods=['POST'])
def register_client():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    global store_email
    store_email = email

    session['email_store'] = email

    if not check_if_client_exists(email):
        insert_new_client(first_name, last_name, email)
    return "Client added unless already exists"

# Create a backend path which recieves a post request when the travel inquiry form page is accessed.
@app.route('/travelinquiryformsubmit', methods=['POST'])
def submit_travel_inquiry_form():
    data = request.get_json()

    email = data.get('email')
    first_name = data.get('fname')
    last_name = data.get('lname')
    destination = data.get('destination')
    departure = data.get('departure')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    is_passport_valid = data.get('valid-passport')
    num_travelers = data.get('travelers')
    underage_travelers = data.get('under-18-is-traveling')
    accommodations = data.get('accommodations')
    rooms = data.get('rooms')
    payment_date = data.get('payment')
    atmosphere = data.get('atmosphere')
    budget = data.get('budget')
    activities = data.get('activities')
    referenced_by = data.get('reference')

    client = find_client(store_email)
    client_id = client[0]['client_id']
    print(client)

    insert_inquiry_info(client_id, email, first_name, last_name, destination, departure, start_date, end_date, is_passport_valid, num_travelers, underage_travelers, accommodations, rooms, payment_date, atmosphere, budget, activities, referenced_by)

    email_message = f"""
    Client: {first_name} {last_name}
    Email: {email}
    Subject: Travel Inquiry Form
    
    Destination: {destination}
    Departure City: {departure}
    Start Date: {start_date}
    End Date: {end_date}
    Valid Passport: {is_passport_valid}
    Number of Travelers: {num_travelers}
    Underage Travelers: {underage_travelers}
    Accommodations: {accommodations}
    Rooms: {rooms}
    Able to make Payment on: {payment_date}
    Atmosphere: {atmosphere}
    Budget: {budget}
    Activities: {activities}
    Referred By: {referenced_by}
    """
    send_email(sender_gmail, f"New Travel Inquiry Form Submission from {first_name} {last_name}", email_message)

    return "Travel Inquiry Form added to db and sent to email"
    
    

# Create a backend path which recieves a post request when a contact form is submitted.
@app.route('/contact', methods=['POST'])
def contact_form():
    data = request.get_json()

    subject = data['subject']
    message = data['message']

    client = find_client(store_email)
    client_id = client[0]['client_id']

    insert_contact_info(client_id, subject, message)

    contact_data = find_contact()
    client_data = find_client_by_id(contact_data[0]['client_id'])
    subject = contact_data[0]['subject']
    first_name = client_data[0]['first_name']
    last_name = client_data[0]['last_name']
    email = client_data[0]['email']
    message = contact_data[0]['message']

    email_message = f"Client: {first_name} {last_name}\nEmail: {email}\nSubject: {subject}\nMessage: {message}"
    send_email(sender_gmail, f"New Contact Form Submission from {first_name} {last_name}", email_message)

    return "Contact form info added to database and sent to email"

app.run()