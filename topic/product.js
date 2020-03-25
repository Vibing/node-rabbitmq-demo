const amqp = require('amqplib');

async function product() {
  // 交换机名称
  const exchangeName = 'testExchange';

  // 路由key 将消息发送到三个队列中
  const routingKeys = ['topic_routing.test1', 'topic_routing.test2'];

  const connect = await amqp.connect('amqp://localhost:5672');
  const channel = await connect.createChannel();

  // 声明交换机 为topic模式
  await channel.assertExchange(exchangeName, 'topic', {
    // 不持久化
    durable: false
  });

  for (let i = 0; i < 5; i++) {
    const curRoutingKey = routingKeys[i % 2];
    await channel.publish(
      exchangeName,
      curRoutingKey,
      Buffer.from(`你好 第${i}条消息 ${curRoutingKey}`)
    );
  }

  await channel.close();
  await connect.close();
}
product();
