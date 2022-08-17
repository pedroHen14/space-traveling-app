import { Post } from '../pages';

export function formattedPosts(posts: any[]): Post[] {
  return posts.map(post => ({
    uid: post.uid,
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
    first_publication_date: post.first_publication_date,
  }));
}
