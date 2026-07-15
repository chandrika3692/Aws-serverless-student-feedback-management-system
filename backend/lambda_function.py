import json
import boto3
import uuid
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('StudentFeedback')


# Convert Decimal values from DynamoDB to int/float for JSON
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError


def lambda_handler(event, context):

    http_method = event.get("httpMethod")

    # ==========================
    # POST - Save Feedback
    # ==========================
    if http_method == "POST":

        body = json.loads(event.get("body", "{}"))

        feedback = {
            "feedbackId": str(uuid.uuid4()),
            "studentName": body.get("studentName"),
            "collegeName": body.get("collegeName"),
            "rollNumber": body.get("rollNumber"),
            "email": body.get("email"),
            "subject": body.get("subject"),
            "rating": int(body.get("rating")),
            "comments": body.get("comments")
        }

        table.put_item(Item=feedback)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "Feedback Submitted Successfully!",
                "data": feedback
            })
        }

    # ==========================
    # GET - Fetch All Feedback
    # ==========================
    elif http_method == "GET":

        response = table.scan()

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps(response["Items"], default=decimal_default)
        }

    # ==========================
    # Invalid Request
    # ==========================
    else:

        return {
            "statusCode": 405,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "Method Not Allowed"
            })
        }