/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { formattedPosts } from '../utils/posts';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  const [pages, setPages] = useState([next_page]);
  const [posts, setPosts] = useState(results);
  const loadNewPosts = async () => {
    fetch(pages.slice(-1)[0])
      .then(response => response.json())
      .then(async (response: PostPagination) => {
        setPages([...pages, response.next_page]);
        const newPosts = formattedPosts(response.results);
        setPosts([...posts, ...newPosts]);
      });
  };

  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post, index) => (
            <Link href={`/post/${post.uid}`} key={index}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.footerContainer}>
                  <time>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                      )}
                  </time>
                  <p>
                    <FiUser />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <span onClick={() => loadNewPosts()}>
          {pages.slice(-1)[0] && 'Carregar mais posts'}
        </span>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 2,
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
  });

  const posts = formattedPosts(postsResponse.results);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
