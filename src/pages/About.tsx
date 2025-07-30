const About = () => {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-4">About GifHub.App</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          Our vision is to become the definitive, community-driven library of high-quality GIFs for the modern professional world, spanning tech, startups, marketing, and corporate culture.
        </p>
        <p>
          GifHub.App is a sleek, ultra-fast, and highly-curated platform for discovering, sharing, and integrating the perfect GIF into any professional conversation, presentation, or workflow. We aim to surpass existing alternatives through a superior user experience, modern design, powerful search, and valuable integrations.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-2">Our Mission</h2>
        <p>
          We are on a mission to provide the best GIFs for:
        </p>
        <ul>
          <li><strong>Founders & Executives:</strong> For investor updates, team announcements, and social media.</li>
          <li><strong>Marketers & Social Media Managers:</strong> For campaigns, blog posts, and community engagement.</li>
          <li><strong>Developers & Product Managers:</strong> For PR descriptions, Slack/Teams conversations, and internal presentations.</li>
        </ul>
      </div>
    </div>
  );
};

export default About;