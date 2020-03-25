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
