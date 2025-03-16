from flask import Flask, request, session
from flask_cors import CORS

from sql import create_connection
from sql import execute_read_query
from sql import execute_update_query

from creds import creds

import secrets

app = Flask(__name__)
app.config["DEBUG"] = True

app.config['SECRET_KEY'] = secrets.token_hex(16)

CORS(app, origins="http://localhost:8080")

def check_if_client_exists(email):
    sql = f"select * from client where email = '{email}'"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return len(result) > 0

def insert_new_client(first_name, last_name, email):
    sql = f"insert into client (first_name, last_name, email) values ('{first_name}', '{last_name}', '{email}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

def find_client(email):
    sql = f"select client_id from client where email = '{email}'"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return result

def insert_contact_info(client_id, subject, message):
    sql = f"insert into contact (client_id, subject, message) values ({client_id}, '{subject}', '{message}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

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

@app.route('/contact', methods=['POST'])
def contact_form():
    data = request.get_json()

    subject = data['subject']
    message = data['message']

    client = find_client(store_email)
    client_id = client[0]['client_id']

    insert_contact_info(client_id, subject, message)

    return "Contact form info added"

app.run()