/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import styles from './post.module.scss';

import { getPrismicClient } from '../../services/prismic';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <div className={styles.postContainer} style={{ textAlign: 'center' }}>
        Carregando...
      </div>
    );
  }

  const countWords = [];

  post.data.content.forEach(({ heading, body }) => {
    const wordsBody = body.map(({ text }) => text.split(' '));

    if (heading) {
      countWords.push(heading?.split(' ').length);
    }

    wordsBody.forEach(item => countWords.push(item.length));
  });

  const wordsQuantity = countWords.reduce((word, nextWord) => word + nextWord);

  const calculateReadingTime = Math.ceil(wordsQuantity / 200);

  return (
    <>
      <main className={styles.container}>
        <img src={post.data.banner.url} className={styles.banner} />
        <article className={styles.postContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.headerPost}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {calculateReadingTime} min
            </span>
          </div>
          {post.data.content.map(({ body, heading }) => (
            <>
              <div>
                <h2 dangerouslySetInnerHTML={{ __html: heading }} />
              </div>
              {body.map(({ text }, index) => (
                <div key={index}>
                  <p dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              ))}
            </>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          slug: 'como-utilizar-hooks',
        },
      },
      {
        params: {
          slug: 'criando-um-app-cra-do-zero',
        },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      subtitle: response.data.subtitle,
      content: response.data.content,
      title: response.data.title,
    },
  };

  return {
    props: {
      post,
    },
  };
};
