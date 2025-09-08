import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress }: BookCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card style={styles.card}>
        <Image source={{ uri: book.imageUrl }} style={styles.image} />
        <Card.Content style={styles.content}>
          <Title numberOfLines={2} style={styles.title}>
            {book.title}
          </Title>
          <Text style={styles.price}>${parseFloat(book.price).toFixed(2)}</Text>
          <Paragraph style={styles.seller}>by {book.sellerName}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default BookCard;