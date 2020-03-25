## Nodejs RabbitMQ
消息队列，本示例只有 direct 和 topic 类型的交换机，因为这两种最常用。

### 安装（Mac版）
- brew install rabbitmq
- brew services start rabbitmq
- 浏览器打开 http://localhost:15672

### 消息生命周期
生产者 --> 交换机 --> 队列 --> 消费者

### 交换机类型
- direct: 把消息路由到哪些 `bingding key` 与 `routing key` 完全匹配的 `queue` 中。
- fanout: 广播，fanout 类型的交换机路由规则 会把该交换机的消息路由到所有与它绑定的 `queue` 中，不需要设置 routing key
- topic：模糊匹配，把消息路由到哪些 `bingding key` 与 `routing key` 模糊匹配的 `queue` 中，两种通配符可选：#：匹配一个或多个关键字，*：只能匹配一个关键字
- headers：不常用 不说了

### 公平调度
```js
// 每次消费1个消息
await channel.prefrech(1, false);
```

## 代码示例(direct类型)
#### 生产者
```js
const amqp = require('amqplib');

async function product() {
  // 交换机名称
  const exchangeName = 'directExchange';

  // 路由key 将消息路由到2个队列中
  const routingKeys = ['direct_routing_test1', 'direct_routing_test2'];

  const connect = await amqp.connect('amqp://localhost:5672');
  const channel = await connect.createChannel();

  // 声明交换机 为direct模式
  await channel.assertExchange(exchangeName, 'direct', {
    // 不持久化
    durable: false
  });

  // 生产消息
  for (let i = 0; i < 5; i++) {
    const curRoutingKey = routingKeys[i % 2];
    await channel.publish(
      exchangeName,
      curRoutingKey,
      Buffer.from(`你好 第${i}条消息 ${curRoutingKey}`)
    );
  }

  // 关闭通道和连接
  await channel.close();
  await connect.close();
}
product();

```

#### 消费者(消费者一，只消费了direct_routing_test1)
```js
const amqp = require('amqplib');

async function consume() {
  // 声明参数
  const exchangeName = 'directExchange';
  const queueName = 'directQueue';
  const routingKey = 'direct_routing_test1';

  const connect = await amqp.connect('amqp://localhost:5672');
  const channel = await connect.createChannel();

  // 声明一个交换机 type=direct
  await channel.assertExchange(exchangeName, 'direct', { durable: false });
  // 声明一个队列
  await channel.assertQueue(queueName);
  // 绑定关系（队列、交换机、路由键）
  await channel.bindQueue(queueName, exchangeName, routingKey);

  // 每次限制处理1条消息
  channel.prefetch(1, false);

  // 消费
  await channel.consume(
    queueName,
    async msg => {
      await deal(msg);
      console.log(msg.content.toString());
      channel.ack(msg);
    },
    { noAck: false }
  );
}

function deal(msg) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(msg);
    }, 1000);
  });
}

consume();

```