import expect from 'expect';
import example from '../../models/example';

describe('example', () => {

  describe('reducer', () => {
    it('it should save', () => {
      expect(example.reducers['example/save']({}, { payload: { a: 1 }})).toEqual({ a: 1 });
    });
  })
});


<video id="${id}" class="video-js" controls="controls" preload="auto" poster="//vjs.zencdn.net/v/oceans.png" data-setup='{}'></video>
<script !src="">
var options = {
    sourceOrder: true,
    sources: [{
        src: '${url}',
        type: 'video/x-flv'
    }],
    techOrder: ['html5', 'flash']
};
var playera = videojs('${id}', options, function onPlayerReady() {
    this.play();
    this.on('ended', function() {
    });
});
</script>