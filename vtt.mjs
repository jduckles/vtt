const vttRegexp = /^(\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}\.\d{3})\s*\n\s*\[([^\]]+)\]:\s*/;

const vttInterviewDirective = {
  name: 'vtt',
  doc: 'A directive for parsing VTT-formatted interview transcripts with metadata and speaker segments.',
  alias: ['interview'],
  arg: {
    type: String,
    doc: 'The path to the interview file, e.g. interview.md',
  },
  options: {
    // Bring in yaml header values
    project: { type: String, doc: 'Project name.' },
    interviewee: { type: String, doc: 'Interviewee name.' },
    date: { type: String, doc: 'Date of the interview.' },
  },
  body: {
    type: 'myst',
    required: true,
  },
  run(data) {
    // This could be the input audio file as an example.
    const filePath = data.arg;

    data.body.forEach((p) => {
      if (p.type !== 'paragraph' || p.children[0].type !== 'text') return;
      const child = p.children[0];
      const match = child.value.match(vttRegexp);
      if (!match) return;
      //  Pull out the timestamp and speaker from the VTT format.
      const [, startTime, endTime, speaker] = match;
      p.data = { startTime, endTime, speaker };
      //  Remove the VTT format from the text.
      child.value = child.value.replace(vttRegexp, '');
      p.children.unshift({
        type: 'span',
        style: {
          backgroundColor: 'blue',
          display: 'inline-block',
          borderRadius: '4px',
          width: '25px',
          height: '25px',
          textAlign: 'center',
          fontSize: '0.5em',
          fontWeight: 'bold',
          color: 'white',
          marginRight: '0.5em',
          float: 'left',
        },
        children: [{ type: 'text', value: speaker }],
      });
    });

    const result = {
      type: 'block',
      metadata: {
        file: filePath,
        project: data.options.project,
        interviewee: data.options.interviewee,
        date: data.options.date,
      },
      children: data.body,
    };

    return [result];
  },
};

const annotationRole = {
  name: 'annotation',
  doc: 'A role annotating text with a class.',
  alias: ['tag'],
  options: {
    class: { type: String, doc: 'Classes to apply to the annotation.' },
  },
  body: {
    type: 'myst',
    required: true,
  },
  run(data) {
    console.log(data);

    return [
      {
        type: 'span', // This could be a different role
        data: { tags: data.options.class.split(' ').filter(Boolean) },
        style: { backgroundColor: 'red' },
        children: data.body,
      },
    ];
  },
};

const plugin = {
  name: 'VTT Interview Parser',
  directives: [vttInterviewDirective],
  roles: [annotationRole],
};

export default plugin;
