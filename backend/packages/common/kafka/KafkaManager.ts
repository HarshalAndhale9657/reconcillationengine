import { Kafka, AdminConfig, Producer, ProducerConfig, KafkaConfig, Admin, ITopicConfig, ConsumerConfig, EachMessagePayload, Message, Consumer } from "kafkajs";

export class KafkaManager {
    private kafka: Kafka;
    private admin: Admin;
    private producer: Producer;
    private consumer: Consumer | undefined;

    constructor(kafkaConfig: KafkaConfig, adminConfig?: AdminConfig) {
        this.kafka = new Kafka(kafkaConfig);
        this.admin = this.kafka.admin(adminConfig);
        this.producer = this.kafka.producer();
        // Note: consumer is not initialized here
    }

    async connectAdmin() {
        try {
            console.log('Connecting Kafka admin...');
            await this.admin.connect();
            console.log('Kafka admin connected.');
        } catch (error) {
            console.error('Failed to connect Kafka admin:', error);
        }
    }

    async disconnectAdmin() {
        try {
            console.log('Disconnecting Kafka admin...');
            await this.admin.disconnect()
            console.log('Kafka admin disconnected.');
        } catch (error) {
            console.error('Failed to connect Kafka admin:', error);
        }
    }

    async createTopics(topicConfig: {
        topic: string;
        numPartitions: number;
        replicationFactor: number
    }[]) {
        try {
            const result = await this.admin.createTopics({
                topics: topicConfig,
                timeout: 3000,
                waitForLeaders: true
            })

            if (result) {
                console.log('Kafka topics created successfully.');
            } else {
                console.log('Kafka topics were already created.');
            }
        } catch (error) {
            console.error('Failed to create Kafka topics:', error);
        }
    }

    async deleteTopics(topics: string[]) {
        try {
            console.log('Deleting Kafka topics:', topics);
            await this.admin.deleteTopics({
                topics: topics,
                timeout: 30000,
            });
            console.log('Kafka topics deleted successfully.');
        } catch (error) {
            console.error('Failed to delete Kafka topics:', error);
        }
    }

    async connectProducer() {
        try {
            console.log("Connecting producer...");
            await this.producer.connect();
            console.log("Producer connected successfully.");
        } catch (error) {
            console.error('Failed to connect Kafka producer:', error);
        }
    }
    async initializeProducer(topic: string, data: any) {
        try {
            console.log(data)
            const msg: Message = {
                key: data.transaction_id,
                value: JSON.stringify(data)
            }
            await this.producer.send({
                topic: topic,
                messages: [msg]
            })
            console.log(`Message sent to topic ${topic}`);
        } catch (error) {
            console.error('Failed to initialize producer:', error);
        }
    }
    async disconnectProducer() {
        try {
            console.log("Disconnecting producer...");
            await this.producer.disconnect();
            console.log("Producer disconnected successfully.");
        } catch (error) {
            console.error('Failed to disconnect Kafka producer:', error);
        }
    }

    async initializeConsumer(topics: string[], groupId: string, eachMessageHandler: (payload: EachMessagePayload) => Promise<void>) {
        try {
            const consumerConfig: ConsumerConfig = { groupId: groupId }
            const consumer = this.kafka.consumer(consumerConfig);
            console.log(`Connecting Kafka consumer`)
            await consumer.connect()
            console.log(`Kafka consumer connected`);
            for (const topic of topics) {
                await consumer.subscribe({ topic });
            }

            await consumer.run({
                eachMessage: async (payload) => {
                    await eachMessageHandler(payload);
                },
            });
            this.consumer = consumer;
        } catch (error) {
            console.error('Failed to initialize Kafka consumer:', error);
        }
    }
    async disconnectConsumer() {
        if (!this.consumer) return;

        console.log(`Disconnecting Kafka consumer`);
        await this.consumer.disconnect();
        this.consumer = undefined;
        console.log(`Kafka consumer disconnected`);
    }
}