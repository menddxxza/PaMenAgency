// Prensa, ruedas de prensa y blog. Los titulares se construyen a partir de
// lo que REALMENTE pasó en el partido, nunca de texto inventado al azar.

import { clamp } from '../core/rng.js';
import { tv, t } from '../core/i18n.js';

export class PressSystem {
  constructor(career) {
    this.career = career;
    this.articles = [];
    this.posts = [];
    this.conferences = [];
  }

  afterMatch(report, assignment) {
    const rng = this.career.rng;
    const ref = this.career.referee;
    const rating = report.rating.overall;
    const worst = report.decisions
      .filter((d) => d.grade === 'incorrect')
      .sort((a, b) => impactRank(b.impact) - impactRank(a.impact))[0];
    const cards = report.stats[0].yellows + report.stats[1].yellows
      + report.stats[0].reds + report.stats[1].reds;
    const fouls = report.stats[0].fouls + report.stats[1].fouls;

    const params = {
      ref: `${ref.firstName} ${ref.lastName}`,
      stadium: report.stadium,
      competition: report.competition,
      home: report.teams[0], away: report.teams[1],
      minute: worst ? worst.minute : 0,
      team: worst && worst.playerId ? report.teams[0] : report.teams[1],
      fouls, cards,
    };

    let key;
    if (report.abandoned) key = 'news.scandal';
    else if (rating >= 8.5) key = 'news.great';
    else if (rating >= 7.2) key = 'news.good';
    else if (rating >= 5.8) key = 'news.mixed';
    else key = 'news.bad';

    const extra = [];
    const varSaved = report.decisions.some((d) => d.varUsed && d.grade === 'correct');
    if (varSaved) extra.push('news.varSaved');
    if (fouls > 26 && cards <= 2) extra.push('news.lenient');
    if (cards >= 8) extra.push('news.strict');

    const made = [{
      key,
      headline: tv(key, params, rng),
      tone: key === 'news.great' || key === 'news.good' ? 'positive'
        : key === 'news.mixed' ? 'neutral' : 'negative',
      season: this.career.season, round: this.career.round,
      rating,
    }];
    for (const k of extra) {
      made.push({
        key: k, headline: tv(k, params, rng), tone: 'neutral',
        season: this.career.season, round: this.career.round, rating,
      });
    }
    this.articles.unshift(...made);
    this.articles = this.articles.slice(0, 60);

    // Seguidores: la polémica también da audiencia
    const buzz = (rating >= 8.5 ? 60 : 0) + (rating < 5.5 ? 90 : 0) + cards * 6
      + (assignment ? assignment.importance : 40);
    ref.followers = Math.round(ref.followers + buzz * clamp(ref.reputation / 60, 0.4, 2.2));
    return made;
  }

  /** Preguntas encadenadas a lo que ocurrió de verdad. */
  buildConference(report, assignment) {
    const qs = [];
    const reds = report.stats[0].reds + report.stats[1].reds;
    const pens = report.stats[0].penalties + report.stats[1].penalties;
    const bad = report.counts.incorrect;
    const varNotUsed = report.decisions.some((d) => !d.varUsed && d.impact === 'critical' && d.grade !== 'correct');

    if (reds > 0) qs.push({ key: 'pressq.redCard', topic: 'red' });
    if (pens > 0) qs.push({ key: 'pressq.penalty', topic: 'penalty' });
    if (varNotUsed) qs.push({ key: 'pressq.var', topic: 'var' });
    if (report.rating.breakdown.control < 5) qs.push({ key: 'pressq.control', topic: 'control' });
    if (bad > 1) qs.push({ key: 'pressq.criticism', topic: 'criticism' });

    if (!qs.length) return null;
    return {
      questions: qs.slice(0, 3).map((q) => ({
        ...q,
        answers: [
          { key: 'pressa.confident', rep: +2.5, press: +1, pressure: +4, risk: true },
          { key: 'pressa.noComment', rep: -0.5, press: -2, pressure: -2 },
          { key: 'pressa.review', rep: +0.5, press: +1, pressure: 0 },
          { key: 'pressa.admit', rep: -2, press: +4, pressure: -6, honest: true },
          { key: 'pressa.deflect', rep: 0, press: -1, pressure: -1 },
        ],
      })),
      matchId: report.matchId,
    };
  }

  answer(question, answerKey, report) {
    const a = question.answers.find((x) => x.key === answerKey);
    if (!a) return null;
    const ref = this.career.referee;
    let rep = a.rep;
    // Ser rotundo tras un error se paga; admitirlo tras acertar es raro
    const wasWrong = report && report.counts.incorrect > 1;
    if (a.risk && wasWrong) rep -= 4;
    if (a.honest && !wasWrong) rep -= 1.5;
    if (a.honest && wasWrong) rep += 2.5;

    ref.reputation = clamp(ref.reputation + rep, 0, 100);
    ref.morale = clamp(ref.morale + (a.pressure < 0 ? 3 : -1), 0, 100);
    this.conferences.push({
      season: this.career.season, round: this.career.round,
      question: question.key, answer: answerKey, repDelta: +rep.toFixed(1),
    });
    return { repDelta: +rep.toFixed(1), pressDelta: a.press };
  }

  /** Publicación en el blog del árbitro. */
  publish(topic, tone) {
    const ref = this.career.referee;
    const rng = this.career.rng;
    const reach = Math.round(ref.followers * rng.float(0.15, 0.6));
    let rep = 0, followers = 0;
    if (tone === 'analysis') { rep = 1.5; followers = reach * 0.05; }
    else if (tone === 'polemic') { rep = -2.5; followers = reach * 0.18; }
    else if (tone === 'humble') { rep = 0.8; followers = reach * 0.02; }
    // Un árbitro que opina de más se expone
    if (tone === 'polemic' && rng.bool(0.35)) {
      this.career.inbox.push({ type: 'federationWarning', season: this.career.season });
      rep -= 2;
    }
    ref.reputation = clamp(ref.reputation + rep, 0, 100);
    ref.followers = Math.round(ref.followers + followers);
    const post = {
      topic, tone, reach, repDelta: +rep.toFixed(1),
      followersGained: Math.round(followers),
      season: this.career.season, round: this.career.round,
    };
    this.posts.unshift(post);
    this.posts = this.posts.slice(0, 40);
    return post;
  }

  serialize() {
    return { articles: this.articles.slice(0, 40), posts: this.posts.slice(0, 20), conferences: this.conferences.slice(-20) };
  }

  restore(d) {
    if (!d) return;
    this.articles = d.articles || [];
    this.posts = d.posts || [];
    this.conferences = d.conferences || [];
  }
}

function impactRank(i) {
  return { low: 0, medium: 1, high: 2, critical: 3 }[i] ?? 0;
}

export default PressSystem;
