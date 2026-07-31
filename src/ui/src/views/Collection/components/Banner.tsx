import Carousel from "react-bootstrap/Carousel";

import styles from "./Banner.module.css";

type BannerProps = {
  title: string;
  imageUrls?: string[];
  interval?: number;
};

export function Banner({
  title,
  imageUrls = [],
  interval = 5000,
}: BannerProps) {
  const slides = imageUrls.length > 0 ? imageUrls : [undefined];

  return (
    <section className={styles.banner} aria-label={title}>
      <Carousel
        fade
        controls={false}
        indicators={false}
        interval={slides.length > 1 ? interval : null}
        pause={false}
        className={styles.carousel}
      >
        {slides.map((imageUrl, index) => (
          <Carousel.Item key={imageUrl ?? index}>
            <div
              className={styles.slide}
              style={
                imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined
              }
            />
          </Carousel.Item>
        ))}
      </Carousel>

      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>
    </section>
  );
}
