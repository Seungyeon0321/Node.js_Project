API (51강 참조)
Application Programming Interface: a piece of software that can be used by another piece of software, in order to allow applications to talk to each other

Separate API into logical resources
Resource: object or representation of something, which has data associated to it. Any information that can be named can be a resource.
만약 객체에 tours, users, reviews가 있다고 하면 이 세개가 resource에 해당함

http://www.natours.com/addNewTour 이 마지막 부분이 ENDPOINT이다

이 endpoint에 따라서 우리는 send different data back to the client

endpoint는 절대로 verb가 되면 안되고 보통 resource name로 설정하는데 이도 보통 복수로 한다, 단수로 설정하지 않는다

HTTP methods(verbs)

1. Post (create) /tours
2. Get (read) /tours/7
3. put whole update
4. path partial update
5. delete

만약 client가 새로운 데이터를 만든다고 했을 때 post를 이용하는데 이때 중요한 점이 url이 get과 같아야 한다는 점이다

Json데이터 같은 경우는 clien가 request를 하면 바로 주는 것이 아니라
response formatting이라고 JSend에 한번 거쳐서 보내게 된다,
Jsend는 json을 데이터를 status를 키를 가지고 있는 오브젝트로 enveloping하게 된다

Stateless Restfull API: All state is handled on the client. This means that each request must contain all the information necessary to process a certain request. The server should not have to remember previous requests.
결국은 clinet에서 state를 명시해줌으로써 서버에서 해당 작업을 하지 않는다는 얘기임.
예를 들어서 currentpage 5였는데 "get /tours/nextpage" 를 보냄으로써 새로운 페이지를 요청을 하게 되면 서버에서 전에 previous page를 기억하고 있어서 여기에다가 +1를 하게 되서 해당 page를 보내게 되는데 이런 코드를 RESTFull api에서는 하지 않는 다는 소리다

클라이언트 웹 서버
get /tours/page/6 ----> send(6)

이렇게 단순하게 끝난다

왜냐면 이미 client에서는 페이지가 5인지 이미 알기 때문에 거기서 처리를 하는것이다

알아보기 stateless vs statefull api 의미

///////////express/////////////////// 58강 참조
The essence of express development: the request-response cycle

incoming request -----미들 웨어-----> response (이 모든 사이클이 request-response cycle이라고 한다)
express는 이렇게 요청을 받았을 때 그 요청에 맞는 데이터를 보내기 위해 미들웨어라는 것을 이용한다
예를 들어서 express.json() 라는 것이 req.body에 접근하기 위해서 사용했는데 이게 미들웨어이다 (everthing is middleware)

우리가 쓰게 될 모든 미들웨어들의 집합을 미들웨어 스택이라고 한다 (콜 스택과 비슷한 개념으로 생각하면 될 듯, 그 순서들의 집합체) 파이프라인을 연상해라

라우터 미들웨어 우리가 만든 미들웨어를 적게되면 동작을 안한다 왜냐면 router를 이용한 미들웨어는 이미 json()으로 그 동작을 end시켯기 때문이다, 여기서 시사하듯이 미들웨어 사용에 있어서 그 순서는 매우 중요하다

그럼 이 미들웨어를 사용하기에 유용한 logging middle웨어 morgan을 사용해보자

////Environment Variable
개발자가 개발을 하는 환경이 다르다는 점에 유의하자, 예를 들어 development 환경이 있고 production 환경이 있는것처럼 말이다

express에서 기본적으로 development의 env를 set해준다, 노드 JS에서는 안해줌

How to connect this env파일 환경 to node application?
pakage를 설치해줘야 한다 'dotenv'

이런 에러를 조우
[windows] "NODE_ENV" is not recognized as an internal or external command, operable command or batch file
해결, what is win-node-env?
npm install -g win-node-env설치해야 한다

eslint는 코드의 룰이라고 보면 된다

//몽고DB - DB - NOSQL <-->
Collects(table)으로 구성되어 있고 그 Collects은 Documents(Rows)로 구성되어 있다

BSon: Data format MongoDB uses for data storage. Like JSON, but typed. so MongoDB documents are typed, like values(String, Number, Boolean 등등) each filed(제이슨의 키라고 생각하면 됨, column이라고도 함), SQL같은 경우는 1 필드에 여러 데이터를 넣을 수 없다, 1개의 필드(컬럼)에 한개만 들어감, 엑셀을 생각하면 됨

예를 들어서 mongodb에는 이런게 가능함 "tag"라는 컬럼이 있고 그 안에 ["MongoDB", "Speace", "ev"]와 같이 여러 values이 들어갈 수 있는 SQl에서는 tags에 딱 한개밖에 못 들어감

Embedding/Denormalizing: Including related data into a single document. This allows for quicker access and easier data models (Its' not always the best solution though).

만약 commnet에 관련 데이터라면
"comments": [
{"author": "Joans", "text" : "heyy!!"}
{"author": "seungyeon", "text" : "wow!"}
{"author": "changJU", "text" : "laha"}
]
와 같이 comments안에 다 넣을 수 있고 한번에 우리는 해당 comment데이터에 다 접근할 수 있음

///mongoose는 mongodb랑 우리 application이랑 연결해주는 하나의 드라이버 같은 역활을 한다고 생각하면 된다

//What is mongoose?
Mongoose is an Object Data Modeling(ODM) library for MongoDB and Node.js, a higher level of abstraction, express랑 nose를 연상하면 될 듯 하다

Mongoose allows for rapid and simple development of mongoDB batabase interactions;

featrues: Schemas to model data and relationships, easy data validation, simple query API, middleware, etc;

Mongoose schema: where we model our data, by describing the structure of the data, default values, and validation;

Mongoose model: a wrapper for the schema, providing an interface to the database for CRUD operations.

we create a model in Mongoose in order to create documents(data column) and also to query updata and delte these documents. So basically, to perform each of the CRUD operation, so create, read, update, and delete.

MVC 아크텍처란?
Model(business logic), Controller(application logic) 그리고 view(presentation logic)와 같이 세개로 나눈 아크텍처를 말한다

----------application logic
code that is only concered about the application's implementation, not the underlying business problem we're trying to solve(e.g. showing and selling tours)

concerned about managing requests and responses
about the app's more technical aspects;
Bridge between model and view layers

-----------Business logic

- Code that actually solves the business problem we set out to solve;
- Directly related to business rules, how the business works, and business needs;
- Examples

1. Creating new tours in the databases;
2. Checking if user's password is correct;
3. Validating user input data;
4. Ensuring only users who bought a tour can review it.

둘이 완전 구별은 못하지만 그래도 되도록 두가지가 분리되도록 노력은 해보도록 하자!

Fat models/thin controllers: offload as much logic as possible into the models, and keep the controllers as simple and lean as possible.

Moongoose의 middleware같은 경우에는 만약 document를 save한다고 했을 때, 그 데이터가 데이터가 베이스가 세이브 되기전 그리고 후에 작동할 수 있는 미들웨어가 있다. 이를 pre | pro hook라고 말한다

4 types middles wares
document, query, aggregate, and model middleware

middle ware는 schema 로직과 함께 작성한다?