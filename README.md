Clickbait.fail
==============

Clickbait pushers frequently lob emotional hacks for profit and incite mobs to seek political retribution.  Ancillary people associated with the target, innocent bystanders, and casual neutrals who tweet the wrong thing are frequently targeted for brigading, doxxing, and harassment.  Reputations are damaged and mindsets are further polarized.  The only person that wins are the clickbait pushers.

And since they feel no desire to measure the wake of their destruction, Clickbait.fail will utilize various sentiment analysis metrics to paint a picture of just how much reputation was destroyed by these corporations.

How It Works
------------

- You enter a Twitter user
- Twitter is searched for the last 100 tweets that reference that person.
- Sentiment, audience, interaction, directionality, and influence are used to generate a sentiment rating.  (Using an [A-FINN111](http://www2.imm.dtu.dk/pubdb/views/publication_details.php?id=6010) word list now)
- People with huge audiences tend to have extreme impacts.  So if a throwaway attacks a celebrity, the negative rating is much, much smaller than if a celebrity counterattacks a throwaway.
- The algorthim for sentiment rating is here: https://docs.google.com/spreadsheets/d/18A6w53zBhCUiTrTy9JaytnNOwaUfa0WDfRboe6eajNI/edit?usp=sharing

Limitations
-----------

- Reputation resets every hour.
- Gathering the subject of a multi-target tweet is extremely difficult, which will cause non-targets within a tweet to get exposed to negative sentiment as well.
- Stock sentiment lists are English only.
- Sentiment is poor with grammar structure and negation, causing incorrect scoring for sarcasm and direct usage of "not".
- Clickbait.fail has no protections against clickbait pushers organizing mass Sybil attacks to offset their abuse.
- The `search/tweets` API call does not return all tweets since  not all Tweets are indexed or made available.
- Retweets are not analyzed for sentiment.
- Intention and spread simulations are off-handed assumptions.
- Hashtag participation is not direct factor into audience calculations, only inferred via interaction.

Todo
-----

- A user's Tweets are not factored into sentiment.  This will be added later to determine how feedback magnifies or nullifies sentiment.
- _"Listen and Believe"_ mode will be added to allow you to toggle between feedback-weighted ratings and mention-only ratings, allowing users to lie to themselves.
- Caching to reduce API roundtrips on repeat requests
- Clustering in case load is insane
- Since sentiment analysis is highly wordlist dependent, the application should allow end users to utilize multiple wordlists to gather a more precise understanding of the damage done by clickbait pushers.