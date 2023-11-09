from flask import Flask, request, jsonify
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CREDIT_LIMIT = 1000


@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    events = data['events']

    available_credit = CREDIT_LIMIT
    payable_balance = 0
    pending_transactions = {}
    settled_transactions = {}

    for event in events:
        txn_id = event['txnId']
        event_type = event['eventType']

        if event_type == 'TXN_AUTHED':
            available_credit -= event['amount']
            pending_transactions[txn_id] = {
                'amount': event['amount'], 'time': event['eventTime']}

        elif event_type == 'TXN_SETTLED':
            difference = event['amount'] - \
                pending_transactions[txn_id]['amount']
            payable_balance += event['amount']
            available_credit -= difference
            settled_transactions[txn_id] = {
                'amount': event['amount'],
                'time': pending_transactions[txn_id]['time'],
                'settled_time': event['eventTime']
            }
            del pending_transactions[txn_id]

        elif event_type == 'TXN_AUTH_CLEARED':
            available_credit += pending_transactions[txn_id]['amount']
            del pending_transactions[txn_id]

        elif event_type == 'PAYMENT_INITIATED':
            payable_balance += event['amount']
            pending_transactions[txn_id] = {
                'amount': event['amount'], 'time': event['eventTime']}

        elif event_type == 'PAYMENT_POSTED':
            available_credit -= pending_transactions[txn_id]['amount']
            settled_transactions[txn_id] = {
                'amount': pending_transactions[txn_id]['amount'],
                'time': pending_transactions[txn_id]['time'],
                'settled_time': event['eventTime']
            }
            del pending_transactions[txn_id]

        elif event_type == 'PAYMENT_CANCELED':
            payable_balance -= pending_transactions[txn_id]['amount']
            del pending_transactions[txn_id]

    structured_response = {
        'available_credit': available_credit,
        'payable_balance': payable_balance,
        'pending_transactions': [
            {'txn_id': txn_id,
                'amount': txn_data['amount'], 'time': txn_data['time']}
            for txn_id, txn_data in pending_transactions.items()
        ],
        'settled_transactions': [
            {
                'txn_id': txn_id,
                'amount': txn_data['amount'],
                'time': txn_data['time'],
                'finalized_time': txn_data['settled_time']
            }
            for txn_id, txn_data in settled_transactions.items()
        ]
    }

    return jsonify(structured_response)


if __name__ == '__main__':
    app.run(host='localhost', debug=True)
