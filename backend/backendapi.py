import flask
from flask import request

from sql import create_connection
from sql import execute_read_query
from sql import execute_update_query

from creds import creds

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def check_if_client_exists(email):
    sql = f"select * from client where email = '{email}'"
    result = execute_read_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)
    return len(result) > 0

def insert_new_client(first_name, last_name, email):
    sql = f"insert into client (first_name, last_name, email) values ('{first_name}', '{last_name}', '{email}')"
    execute_update_query(create_connection(creds.myhostname, creds.uname, creds.passwd, creds.dbname), sql)

@app.route('/travelinquiryform', methods=['POST'])
def register_client():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not check_if_client_exists(email):
        insert_new_client(first_name, last_name, email)
    return 

app.run()