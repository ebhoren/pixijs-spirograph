function drawRoundedPolygon(graphics, path, radius) {
    let len = path.length;
    let first;
    for (let i = 0 ; i < len; i++) {
        // get the current point and the next two
        let p1 = path[i];
        let p2 = path[(i + 1) % len];
        let p3 = path[(i + 2) % len];
        
        // vector 1
        let dx1 = p2.x - p1.x;
        let dy1 = p2.y - p1.y;
        // vector 2
        let dx2 = p2.x - p3.x;
        let dy2 = p2.y - p3.y;
        
        // angle between vector 1 and vector 2 divided by 2
        let angle = (Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)) / 2;
        // the length of segment between angular point and the
        // points of intersection with the circle of a given radius
        let tan = Math.abs(Math.tan(angle));
        let seg = radius / tan;
        // check the segment
        let len1 = getLength(dx1, dy1);
        let len2 = getLength(dx2, dy2);
        
        // points of intersection are calculated by the proportion between 
        // the coordinates of the vector, length of vector and the length of the segment
        let p1Cross = getProportionPoint(p2, seg, len1, dx1, dy1);
        let p2Cross = getProportionPoint(p2, seg, len2, dx2, dy2);
        // calculation of the coordinates of the circle 
        // center by the addition of angular vectors
        let dx = p2.x * 2 - p1Cross.x - p2Cross.x;
        let dy = p2.y * 2 - p1Cross.y - p2Cross.y;
        let L = getLength(dx, dy);
        let d = getLength(seg, radius);
        // center radius
        let cx = getProportionPoint(p2, d, L, dx, dy);
        // start and end angle of arc
        let startAngle = Math.atan2(p1Cross.y - cx.y, p1Cross.x - cx.x);
        let endAngle = Math.atan2(p2Cross.y - cx.y, p2Cross.x - cx.x);
        
        // get clock wise direction to draw the arc
        let sweepAngle = endAngle - startAngle;
        if (sweepAngle < -Math.PI) {
            sweepAngle = Math.PI * 2 + sweepAngle;
        } else if (sweepAngle > Math.PI) {
            sweepAngle = sweepAngle - Math.PI * 2;
        }
        let anticlockwise = sweepAngle < 0 || sweepAngle > Math.PI;
        if (i === 0) {
            graphics.moveTo(p1Cross.x, p1Cross.y);
            first = p1Cross
        } else {
            graphics.lineTo(p1Cross.x, p1Cross.y);
        }
                        
        // draw the arc to connect the next vector
        graphics.arc(cx.x, cx.y, radius, startAngle, endAngle, anticlockwise);
    }
    
    // close the path
    graphics.lineTo(first.x, first.y);
}

function getLength(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

function getProportionPoint(point, segment, length, dx, dy) {
    let factor = segment / length;
    return new PIXI.Point(point.x - dx * factor, point.y - dy * factor);
}

export default drawRoundedPolygon;