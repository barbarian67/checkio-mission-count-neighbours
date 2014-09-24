//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210', 'snap.svg_030'],
    function (ext, $, Raphael, Snap) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide = {};
            cur_slide["in"] = data[0];
            this_e.addAnimationSlide(cur_slide);
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            //YOUR FUNCTION NAME
            var fname = 'сount_neighbours';

            var checkioInput = data.in || [
                [
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                1, 1
            ];
            var checkioInputStr = fname + '(<br>    (' +
                JSON.stringify(checkioInput[0][0]).replace("[", "(").replace("]", ")") + ",";
            for (var i = 1; i < checkioInput[0].length; i++) {
                checkioInputStr += "<br>     " +
                    JSON.stringify(checkioInput[0][i]).replace("[", "(").replace("]", ")") + ",";
            }
            checkioInputStr += "), " + String(checkioInput[1]) + ", " + String(checkioInput[2]) + ")";

            var failError = function (dError) {
                $content.find('.call div').html(checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            $content.find('.call div').html(checkioInputStr);
            $content.find('.output').html('Working...');

            var svg = new SVG($content.find(".explanation")[0]);
            svg.prepare(checkioInput[0], checkioInput[1], checkioInput[2]);

            if (data.ext) {
                var rightResult = data.ext["answer"];
                var userResult = data.out;
                var result = data.ext["result"];
                var result_addon = data.ext["result_addon"];

                var explanation = data.ext["explanation"];

                $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));
                if (!result) {
                    $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                    $content.find('.answer').addClass('error');
                    $content.find('.output').addClass('error');
                    $content.find('.call').addClass('error');
                }
                else {
                    $content.find('.answer').remove();
                }
            }
            else {
                $content.find('.answer').remove();
            }


            //Your code here about test explanation animation
            //$content.find(".explanation").html("Something text for example");
            //
            //
            //
            //
            //


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });

        function SVG(dom) {

            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            var cell = 30;
            var pad = 10;

            var paper;

            var sizeXpx;
            var sizeYpx;



            var attrRect = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorBlue1};
            var attrRectBingo = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorOrange1};
            var attrRectNeigh = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorBlue2};
            var attrCircle = {"stroke": colorBlue4, "stroke-width": 1, "fill": colorBlue4};
            var attrCircleNeigh = {"stroke": colorBlue4, "stroke-width": 1, "fill": colorOrange4};

            this.prepare = function (grid, row, col) {

                sizeXpx = cell * grid[0].length + 2 * pad;
                sizeYpx = cell * grid.length + 2 * pad;

                paper = Raphael(dom, sizeXpx, sizeYpx);

                for (var i = 0; i < grid.length; i++) {
                    for (var j = 0; j < grid[0].length; j++) {
                        var r = paper.rect(cell * j + pad, cell * i + pad, cell, cell);
                        var isNeigh = false;
                        if (i === row && j === col) {
                            r.attr(attrRectBingo)
                        }
                        else if ("1101".indexOf(String(Math.abs(i - row)) + String(Math.abs(j - col))) !== -1) {
                            r.attr(attrRectNeigh);
                            isNeigh = true
                        }
                        else {
                            r.attr(attrRect)
                        }
                        if (grid[i][j] === 1) {
                            var c = paper.circle(cell * j + pad + cell / 2, cell * i + pad + cell / 2, cell / 4);
                            if (isNeigh) {
                                c.attr(attrCircleNeigh);
                            }
                            else {
                                c.attr(attrCircle)
                            }
                        }
                    }
                }
            };

        }

    }
);
