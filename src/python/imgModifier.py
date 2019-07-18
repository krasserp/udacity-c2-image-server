from __future__ import print_function
import cv2 as cv
import argparse
import os
import calendar
import time

ts = calendar.timegm(time.gmtime())
cwd = os.getcwd()
relPath = os.path.dirname(os.path.abspath(__file__))
#print(cwd, __file__, os.path.realpath(__file__),'\n\n', os.path.dirname(__file__))


def CannyThreshold(val):
    low_threshold = val
    img_blur = cv.blur(src_gray, (3, 3))
    detected_edges = cv.Canny(img_blur, low_threshold,
                              low_threshold*ratio, kernel_size)
    mask = detected_edges != 0
    dst = src * (mask[:, :, None].astype(src.dtype))
    #cv.imshow(window_name, dst)
    return dst


parser = argparse.ArgumentParser(
    description='Code for Canny Edge Detector tutorial.')
parser.add_argument('--input', help='Path to input image.',
                    default='fruits.jpg')
parser.add_argument('--ratio', help='ratio value',
                    default=3)
parser.add_argument('--kernel_size', help='KernelSizeValue',
                    default=3)
parser.add_argument('--threshold', help='threshold value',
                    default=3)
args = parser.parse_args()

src = cv.imread(cv.samples.findFile(args.input))
if src is None:
    print('Could not open or find the image: ', args.input)
    exit(0)
kernel_size = float(args.kernel_size)
ratio = float(args.ratio)
threshold = float(args.threshold)

src_gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)

test = CannyThreshold(threshold)
newPath = relPath+'/../util/tmp/'+str(ts)+'.jpg'
print(newPath)
cv.imwrite(newPath, test)
