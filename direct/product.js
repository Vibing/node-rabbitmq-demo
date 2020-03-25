const amqp = require('amqplib');

async function product() {
  // 交换机名称
  const exchangeName = 'directExchange';

  // 路由key 将消息发送到三个队列中
  const routingKeys = ['direct_routing_test1', 'direct_routing_test2'];

  const connect = await amqp.connect('amqp://localhost:5672');
  const channel = await connect.createChannel();

  // 声明交换机 为direct模式
  await channel.assertExchange(exchangeName, 'direct', {
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

  // 关闭通道和连接
  await channel.close();
  await connect.close();
}
product();
