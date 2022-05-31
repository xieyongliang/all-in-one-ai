import datetime
import boto3

class ddb_helper:
    def __init__(self, params):
        self.db = boto3.resource('dynamodb')
        self.table_name = params['table_name']
        self.table = self.db.Table(self.table_name)

    def table_exist(self):
        try:
            self.table.scan().get("Count")
        except Exception as e:
            if type(e).__name__ == 'ResourceNotFoundException':
                return False
            else:
                return None
        return True

    def create_table(self, params):
        start = datetime.datetime.now()
        self.table = self.db.create_table(TableName = self.table_name,
                                          KeySchema = params['key_schema'],
                                          AttributeDefinitions = params['attribute_definitions'],
                                          ProvisionedThroughput = params['provisioned_throughput'])
        self.table.meta.client.get_waiter('table_exists').wait(TableName = self.table_name)
        print('completed table {} init within {} seconds'.format(self.table_name, datetime.datetime.now() - start))

    def put_item(self, params):
        print(params)
        print(self.table.put_item(Item=params))

    def update_item(self, key, params):
        update_expression = 'set '
        for x in range(0, len(params)):
            update_expression += '#k{} = :v{}, '.format(x, x)
        update_expression = update_expression[0:len(update_expression) - 2]
        print(update_expression)
        
        params_k = {}
        i = 0
        for field in params:
            params_k['#k{}'.format(i)] = field
            i += 1
        print(params_k)
        
        params_v = {}
        i = 0
        for field in params:
            params_v[':v{}'.format(i)] = params[field]
            i += 1
        print(params_v)

        response = self.table.update_item(
            Key = key,
            UpdateExpression = update_expression,
            ExpressionAttributeNames = params_k,
            ExpressionAttributeValues = params_v
        )
        return response

    def delete_item(self, key):
        response = self.table.delete_item(
            Key = key
        )
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            print("Delete success!")
        else:
            print("Delete failed!")
        return response

    def get_item(self, key):
        response = self.table.get_item(
            Key = key
        )

        if response.__contains__('Item'):
            item = response['Item']
            print("found {}".format(item))
            return item
        else:
            return None
    
    def scan(self, **kwargs):
        items = []

        done = False
        start_key = None

        while not done:
            if start_key:
                kwargs['ExclusiveStartKey'] = start_key
            response = self.table.scan(**kwargs)
            items += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None
        return items

class ssm_helper:
    def __init__(self):
        self.ssm = boto3.client('ssm')
    def get_parameter(self, name):
        response = self.ssm.get_parameter(
            Name = name,
            WithDecryption = False
        )
        return response['Parameter']['Value']